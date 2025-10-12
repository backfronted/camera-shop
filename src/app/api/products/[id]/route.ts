import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db"; // из api/products/[id] -> lib/db

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const p = await prisma.product.findUnique({ where: { id: params.id } });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mapped = {
    ...p,
    tags: p.tags ? p.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
    features: p.features ? p.features.split(",").map(s => s.trim()).filter(Boolean) : [],
  };
  return NextResponse.json(mapped);
}
