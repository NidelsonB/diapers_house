import { NextResponse } from "next/server";

import { clearAdminSession, getCurrentAdminSession } from "@/lib/auth";
import { getAdminSiteData, resetDatabase } from "@/lib/site-repository";

export async function POST() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await resetDatabase();
  await clearAdminSession();
  const data = await getAdminSiteData();

  return NextResponse.json({ data, loggedOut: true });
}
