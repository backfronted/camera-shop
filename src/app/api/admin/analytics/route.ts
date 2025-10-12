import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  // проверка ключа, как в других админ-роутах
  const deny = requireAdmin(req);
  if (deny) return deny;

  // статусы, которые считаем в выручку
  const PAID_STATUSES = ["PAID", "DELIVERED"];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 6); // последние 7 дней
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // берём данные за ~последние 30 дней для графика и сумм
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: monthAgo } },
    orderBy: { createdAt: "asc" },
  });

  const isPaid = (s: string) => PAID_STATUSES.includes((s || "").toUpperCase());
  const onlyPaid = orders.filter(o => isPaid(o.status));
  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

  const todayRevenue = sum(onlyPaid.filter(o => o.createdAt >= startOfToday).map(o => o.amount));
  const weekRevenue  = sum(onlyPaid.filter(o => o.createdAt >= startOfWeek ).map(o => o.amount));
  const monthRevenue = sum(onlyPaid.filter(o => o.createdAt >= startOfMonth).map(o => o.amount));

  const todayOrders  = onlyPaid.filter(o => o.createdAt >= startOfToday).length;
  const weekOrders   = onlyPaid.filter(o => o.createdAt >= startOfWeek ).length;
  const monthOrders  = onlyPaid.filter(o => o.createdAt >= startOfMonth).length;

  const avgCheck = onlyPaid.length ? Math.round(sum(onlyPaid.map(o => o.amount)) / onlyPaid.length) : 0;

  // по дням
  const byDayMap = new Map<string, { revenue: number; orders: number }>();
  for (const o of onlyPaid) {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const cell = byDayMap.get(key) || { revenue: 0, orders: 0 };
    cell.revenue += o.amount;
    cell.orders  += 1;
    byDayMap.set(key, cell);
  }
  const byDay = Array.from(byDayMap.entries())
    .sort((a,b) => a[0] < b[0] ? -1 : 1)
    .map(([date, v]) => ({ date, ...v }));

  // топ-товары
  const topMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of onlyPaid) {
    try {
      const items = JSON.parse(o.items) as Array<{ id:string; name:string; price:number; qty:number }>;
      for (const it of items) {
        const cell = topMap.get(it.id) || { name: it.name, qty: 0, revenue: 0 };
        cell.qty += it.qty;
        cell.revenue += it.price * it.qty;
        topMap.set(it.id, cell);
      }
    } catch {}
  }
  const topProducts = Array.from(topMap.values())
    .sort((a,b)=> b.revenue - a.revenue)
    .slice(0, 10);

  return NextResponse.json({
    todayRevenue, weekRevenue, monthRevenue,
    todayOrders, weekOrders, monthOrders,
    avgCheck,
    byDay,
    topProducts,
  });
}
