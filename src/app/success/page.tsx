"use client";
import { useSearchParams } from "next/navigation";

export default function Success() {
  const sp = useSearchParams();
  const order = sp.get("order");
  return (
    <main className="max-w-lg mx-auto p-6 space-y-3 text-center">
      <h1 className="text-2xl font-bold">Спасибо! ✅</h1>
      <p>
        Ваш заказ принят. Номер заказа: <b>{order}</b>
      </p>
      <a href="/" className="btn mt-2 inline-block">
        Вернуться в каталог
      </a>
    </main>
  );
}
