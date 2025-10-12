import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(req: NextRequest) {
  const header = req.headers.get("x-admin-key") || "";
  const ok = process.env.ADMIN_KEY && header === process.env.ADMIN_KEY;
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
