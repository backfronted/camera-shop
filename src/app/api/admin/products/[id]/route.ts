import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const body = await req.json();
  const { name, price, image, tags, features, stock } = body || {};

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(features !== undefined ? { features } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = requireAdmin(req);
  if (deny) return deny;
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
