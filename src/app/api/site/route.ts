import { NextResponse } from "next/server";

import { getPublicSiteData } from "@/lib/site-repository";

export async function GET() {
  const data = await getPublicSiteData();
  return NextResponse.json({ data });
}
