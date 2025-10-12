import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const body = await req.json();
  const { name, price, image, tags = "", features = "", stock = 0 } = body || {};
  if (!name || !price || !image) {
    return NextResponse.json({ error: "name, price, image обязательны" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { name, price: Number(price), image, tags, features, stock: Number(stock || 0) },
  });
  return NextResponse.json(product);
}
