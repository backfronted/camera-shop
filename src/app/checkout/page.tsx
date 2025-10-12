"use client";
import { useState, useMemo } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
const fmt = (n:number)=>new Intl.NumberFormat("ru-RU").format(n);

export default function CheckoutPage() {
  const [cart, setCart] = useLocalStorage<any[]>("cart", []);
  const total = useMemo(()=>cart.reduce((s,c)=>s+c.price*c.qty,0),[cart]);

  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [address, setAddress]       = useState("");

  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) { alert("Корзина пуста"); return; }
    if (!firstName || !lastName || !phone || !address) { alert("Заполните обязательные поля"); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          firstName, lastName, middleName, phone, email, address,
          items: cart,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error || "Ошибка оформления");
      }
      // очищаем корзину и показываем успех
      setCart([]);
      window.location.href = "/success";
    } catch (e:any) {
      alert(e.message || "Ошибка оформления");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 grid gap-6 md:grid-cols-2">
      <section className="card p-5 space-y-3">
        <h1 className="text-xl font-bold">Оформление заказа</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Фамилия *" value={lastName} onChange={e=>setLastName(e.target.value)} />
            <input className="input" placeholder="Имя *" value={firstName} onChange={e=>setFirstName(e.target.value)} />
            <input className="input md:col-span-2" placeholder="Отчество" value={middleName} onChange={e=>setMiddleName(e.target.value)} />
          </div>
          <input className="input" placeholder="Телефон *" value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="input" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <textarea className="input" rows={3} placeholder="Полный адрес * (город, улица, дом, квартира)"
                    value={address} onChange={e=>setAddress(e.target.value)} />
          <button className="btn" disabled={busy || !cart.length}>
            {busy ? "Отправляем..." : "Отправить заказ"}
          </button>
          <p className="text-xs text-gray-500">
            После отправки наш менеджер свяжется с вами и отправит реквизиты для оплаты (карта/перевод).
          </p>
        </form>
      </section>

      <aside className="card p-5 space-y-3">
        <h2 className="font-semibold">Состав заказа</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">Корзина пуста</div>
        ) : (
          <div className="space-y-2">
            {cart.map(it=>(
              <div key={it.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <img src={it.image} className="w-10 h-10 rounded object-cover" />
                  <div>{it.name} × {it.qty}</div>
                </div>
                <div className="font-medium">{fmt(it.price*it.qty)}</div>
              </div>
            ))}
            <div className="border-t pt-2 flex items-center justify-between font-bold">
              <span>Итого</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
