"use client";

import useSWR from "swr";
import Link from "next/link";
import { useMemo, useState } from "react";

const fetcher = (url: string) => {
  const key = localStorage.getItem("ADMIN_KEY") || "";
  return fetch(url, { headers: { "x-admin-key": key } }).then(r => r.json());
};

const fmt = (n:number)=> new Intl.NumberFormat("ru-RU").format(n);
const STATUSES = ["PENDING","CONFIRMED","PAID","DELIVERED","CANCELED"] as const;

export default function OrderDetails({ params }: { params: { id: string } }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/orders/${params.id}`, fetcher);

  const items: Array<{id:string; name:string; price:number; qty:number}> = useMemo(()=>{
    try { return data?.items ? JSON.parse(data.items) : []; } catch { return []; }
  }, [data]);

  const [busy, setBusy] = useState(false);

  async function updateStatus(next: string) {
    setBusy(true);
    const key = localStorage.getItem("ADMIN_KEY") || "";
    const res = await fetch(`/api/orders/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json", "x-admin-key": key },
      body: JSON.stringify({ status: next })
    });
    setBusy(false);
    if (!res.ok) return alert("Не удалось изменить статус");
    mutate();
  }

  async function removeOrder() {
    if (!confirm("Удалить заказ безвозвратно?")) return;
    setBusy(true);
    const key = localStorage.getItem("ADMIN_KEY") || "";
    const res = await fetch(`/api/orders/${params.id}`, {
      method: "DELETE",
      headers: { "x-admin-key": key },
    });
    setBusy(false);
    if (!res.ok) return alert("Не удалось удалить");
    location.href = "/admin/orders";
  }

  if (!localStorage.getItem("ADMIN_KEY")) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Детали заказа</h1>
        <p className="text-gray-600">Сначала зайдите на <Link href="/admin" className="underline">/admin</Link> и сохраните ADMIN_KEY.</p>
      </main>
    );
  }

  if (isLoading) return <main className="max-w-5xl mx-auto p-6">Загрузка…</main>;
  if (error || data?.error) return <main className="max-w-5xl mx-auto p-6 text-red-600">Ошибка загрузки.</main>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Заказ #{data.id?.slice(0,8)}</h1>
          <div className="text-sm text-gray-600">{new Date(data.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders" className="btn">← Назад к заказам</Link>
          <button className="btn" onClick={removeOrder}>Удалить</button>
        </div>
      </div>

      <section className="card p-4">
        <h2 className="font-semibold mb-2">Клиент</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-600">Имя:</span> <b>{data.name || "-"}</b></div>
          <div><span className="text-gray-600">Телефон:</span> <b>{data.phone || "-"}</b></div>
          <div><span className="text-gray-600">Сумма:</span> <b>{fmt(data.amount)} сум</b></div>
          <div><span className="text-gray-600">Статус:</span> <b>{data.status}</b></div>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-semibold mb-3">Состав заказа</h2>
        {!items.length ? (
          <div className="text-gray-600">Пусто</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Товар</th>
                  <th className="py-2">Кол-во</th>
                  <th className="py-2">Цена</th>
                  <th className="py-2">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-2">{it.name}</td>
                    <td className="py-2">{it.qty}</td>
                    <td className="py-2">{fmt(it.price)}</td>
                    <td className="py-2 font-medium">{fmt(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-4">
        <h2 className="font-semibold mb-2">Действия</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              disabled={busy || data.status === s}
              className={"btn " + (data.status === s ? "opacity-60 cursor-default" : "")}
              onClick={() => updateStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
