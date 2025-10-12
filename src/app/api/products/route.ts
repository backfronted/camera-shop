import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  const items = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  const mapped = items.map(p => ({
    ...p,
    tags: p.tags ? p.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
    features: p.features ? p.features.split(",").map(s => s.trim()).filter(Boolean) : []
  }));
  return NextResponse.json(mapped);
}
