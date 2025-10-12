"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  createdAt: string;
  // новые поля
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  email?: string | null;
  address?: string;
  // старые поля (на всякий)
  name?: string;
  phone: string;
  amount: number;
  items: string; // JSON как строка
  status: string;
};

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

function fullName(o: Order) {
  const fn = [o.lastName, o.firstName, o.middleName].filter(Boolean).join(" ").trim();
  return fn || (o.name || "-");
}

export default function OrdersPage() {
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const k = localStorage.getItem("ADMIN_KEY") || "";
    setKey(k);
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders", { headers: { "x-admin-key": key } });
    if (!res.ok) {
      alert("Нет доступа или ошибка");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    if (key) load();
  }, [key]);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("Не удалось сменить статус");
      return;
    }
    load();
  }

  if (!key) {
    return (
      <main className="max-w-md mx-auto p-6 space-y-3">
        <h1 className="text-xl font-bold">Доступ к заказам</h1>
        <input
          className="input w-full"
          placeholder="Введите ADMIN_KEY"
          onChange={(e) => {
            localStorage.setItem("ADMIN_KEY", e.target.value);
            setKey(e.target.value);
          }}
        />
        <p className="text-sm text-gray-500">Ключ хранится в вашем браузере.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Заказы</h1>

      {loading ? (
        <div>Загрузка…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((o) => {
            const items = (() => {
              try {
                return JSON.parse(o.items) as Array<{ id: string; name: string; qty: number }>;
              } catch {
                return [];
              }
            })();

            return (
              <div key={o.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">#{o.id.slice(0, 8)}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Клиент */}
                <div className="text-sm">👤 {fullName(o)}</div>
                <div className="text-sm">📞 {o.phone || "-"}</div>
                {o.email ? <div className="text-sm">✉️ {o.email}</div> : null}
                {o.address ? <div className="text-sm">🏠 {o.address}</div> : null}

                {/* Состав */}
                <div className="text-sm text-gray-600">
                  {items.length ? (
                    items.map((it) => (
                      <div key={it.id}>
                        {it.name} × {it.qty}
                      </div>
                    ))
                  ) : (
                    <span>Состав не указан</span>
                  )}
                </div>

                {/* Сумма */}
                <div className="font-bold">Итого: {fmt(o.amount)} сум</div>

                {/* Действия */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
                    Статус: {o.status}
                  </span>

                  <button className="btn" onClick={() => setStatus(o.id, "CONFIRMED")}>
                    Подтвердить
                  </button>
                  <button className="btn" onClick={() => setStatus(o.id, "PAID")}>
                    Оплачен
                  </button>
                  <button className="btn" onClick={() => setStatus(o.id, "DELIVERED")}>
                    Доставлен
                  </button>
                  <button className="btn" onClick={() => setStatus(o.id, "CANCELED")}>
                    Отменить
                  </button>

                  <Link href={`/admin/orders/${o.id}`} className="btn">
                    Открыть
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
