import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentAdminSession();
  return NextResponse.json({
    authenticated: Boolean(session),
    admin: session
      ? {
          id: session.adminUser.id,
          email: session.adminUser.email,
          name: session.adminUser.name,
        }
      : null,
  });
}
