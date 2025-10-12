"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";

const fetcher = (key: string) => {
  const k = localStorage.getItem("ADMIN_KEY") || "";
  return fetch(key, { headers: { "x-admin-key": k } }).then(r => r.json());
};
const fmt = (n:number)=> new Intl.NumberFormat("ru-RU").format(n);

export default function AnalyticsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/analytics", fetcher);
  const [ok, setOk] = useState(false);

  useEffect(()=>{
    // проверим, что ключ админа сохранён
    setOk(!!localStorage.getItem("ADMIN_KEY"));
  },[]);

  if (!ok) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Метрики</h1>
        <p className="text-gray-600">Сначала зайдите в <b>/admin</b> и сохраните ADMIN_KEY, чтобы открыть метрики.</p>
      </main>
    );
  }

  if (isLoading) {
    return <main className="max-w-6xl mx-auto p-6">Загрузка…</main>;
  }
  if (error || data?.error) {
    return <main className="max-w-6xl mx-auto p-6 text-red-600">Ошибка доступа или загрузки.</main>;
  }

  const kpi = [
    { label: "Сегодня, выручка",  value: fmt(data.todayRevenue || 0) + " сум" },
    { label: "7 дней, выручка",   value: fmt(data.weekRevenue  || 0) + " сум" },
    { label: "Месяц, выручка",    value: fmt(data.monthRevenue || 0) + " сум" },
    { label: "Средний чек",       value: fmt(data.avgCheck     || 0) + " сум" },
    { label: "Заказы сегодня",    value: data.todayOrders || 0 },
    { label: "Заказы (7 дней)",   value: data.weekOrders  || 0 },
    { label: "Заказы (месяц)",    value: data.monthOrders || 0 },
  ];

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Метрики</h1>
        <button className="btn" onClick={()=>mutate()}>Обновить</button>
      </div>

      {/* KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpi.map((x) => (
          <div key={x.label} className="card p-4">
            <div className="text-sm text-gray-600">{x.label}</div>
            <div className="text-xl font-bold mt-1">{x.value}</div>
          </div>
        ))}
      </section>

      {/* График по дням — пока таблицей (без внешних либ) */}
      <section className="card p-4">
        <h2 className="font-semibold mb-2">Выручка по дням (последние 30 дней)</h2>
        {(!data.byDay || data.byDay.length === 0) ? (
          <div className="text-gray-600">Нет данных</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Дата</th>
                  <th className="py-2">Выручка</th>
                  <th className="py-2">Заказы</th>
                </tr>
              </thead>
              <tbody>
                {data.byDay.map((d: any) => (
                  <tr key={d.date} className="border-t">
                    <td className="py-2">{d.date}</td>
                    <td className="py-2 font-medium">{fmt(d.revenue)}</td>
                    <td className="py-2">{d.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Топ-товары */}
      <section className="card p-4">
        <h2 className="font-semibold mb-2">Топ-товары (по выручке)</h2>
        {(!data.topProducts || data.topProducts.length === 0) ? (
          <div className="text-gray-600">Нет данных</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Товар</th>
                  <th className="py-2">Кол-во</th>
                  <th className="py-2">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.qty}</td>
                    <td className="py-2 font-medium">{fmt(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
