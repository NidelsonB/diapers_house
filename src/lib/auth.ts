import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);

export const ADMIN_SESSION_COOKIE = "lcdp_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const QA_ADMIN_ID = "qa-admin";

const isQaAdminBypassEnabled = () => process.env.QA_ADMIN_BYPASS === "true";

const getQaAdminSession = () => ({
  id: "qa-session",
  tokenHash: "qa-bypass",
  expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  adminUserId: QA_ADMIN_ID,
  adminUser: {
    id: QA_ADMIN_ID,
    email: process.env.ADMIN_EMAIL ?? "admin@lacasadelpanal.com",
    name: process.env.ADMIN_NAME ?? "Administrador QA",
    passwordHash: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

const normalizeSecret = () => {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be defined with at least 32 characters.");
  }

  return secret;
};

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(`${password}${normalizeSecret()}`, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;

  const derivedKey = (await scrypt(`${password}${normalizeSecret()}`, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(`${token}${normalizeSecret()}`).digest("hex");
}

export async function createAdminSession(adminUserId: string) {
  if (isQaAdminBypassEnabled()) {
    return;
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSession() {
  if (isQaAdminBypassEnabled()) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });
    return;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentAdminSession() {
  if (isQaAdminBypassEnabled()) {
    return getQaAdminSession();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getCurrentAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}
