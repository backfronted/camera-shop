// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegram, esc } from "@/lib/telegram";

// ======= СПИСОК ЗАКАЗОВ (для админки) =======
export async function GET(req: Request) {
  const key = req.headers.get("x-admin-key") || "";
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// ======= СОЗДАНИЕ ЗАКАЗА (чекаут) =======
type CartItem = { id: string; name: string; price: number; image?: string; qty: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      middleName = "",
      phone,
      email = "",
      address,
      items,
    } = body as {
      firstName: string;
      lastName: string;
      middleName?: string;
      phone: string;
      email?: string;
      address: string;
      items: CartItem[];
    };

    if (!firstName || !lastName || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Проверьте поля формы" }, { status: 400 });
    }

    const amount = items.reduce((s, it) => s + it.price * it.qty, 0);

    const order = await prisma.order.create({
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        phone,
        email: email || null,
        address,
        amount,
        items: JSON.stringify(items),
        status: "PENDING",
        name: `${lastName} ${firstName}${middleName ? " " + middleName : ""}`, // совместимость
      },
    });

    const lines = items.map(i => `• ${esc(i.name)} × ${i.qty}`).join("\n");
    const msg =
      `<b>🆕 Новый заказ</b>\n` +
      `#${esc(order.id.slice(0,8))}\n\n` +
      `<b>Клиент:</b> ${esc(lastName)} ${esc(firstName)}${middleName ? " " + esc(middleName) : ""}\n` +
      `<b>Телефон:</b> ${esc(phone)}\n` +
      (email ? `<b>Email:</b> ${esc(email)}\n` : "") +
      `<b>Адрес:</b> ${esc(address)}\n\n` +
      `<b>Товары:</b>\n${lines}\n\n` +
      `<b>Сумма:</b> ${new Intl.NumberFormat("ru-RU").format(amount)} сум`;
    await sendTelegram(msg, { parseMode: "HTML" });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "create order error" }, { status: 400 });
  }
}
