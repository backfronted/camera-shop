import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegram, esc } from "@/lib/telegram";

// простая проверка админ-ключа из заголовка
function requireAdmin(req: NextRequest | Request) {
  // @ts-ignore - совместим оба типа
  const key = req.headers.get("x-admin-key") || "";
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// GET /api/orders/[id] — один заказ (для страницы деталей)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

// PUT /api/orders/[id] — обновить (например, статус)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json(); // { status?: string, ... }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: body,
    });

    if (body.status) {
      const msg =
        `<b>✳️ Обновление заказа</b>\n` +
        `#${esc(order.id.slice(0, 8))}\n` +
        `Статус: <b>${esc(String(body.status))}</b>`;
      await sendTelegram(msg, { parseMode: "HTML" });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Update error" }, { status: 400 });
  }
}

// DELETE /api/orders/[id] — удалить заказ
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  try {
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Delete error" }, { status: 400 });
  }
}
