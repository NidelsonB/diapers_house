import { NextResponse } from "next/server";

import { getAdminSiteData } from "@/lib/site-repository";
import { getCurrentAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAdminSiteData();
  return NextResponse.json({ data });
}
