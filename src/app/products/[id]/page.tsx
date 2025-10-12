"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useLocalStorage } from "@/lib/useLocalStorage";

const currency = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [prod, setProd] = useState<any | undefined>(undefined); // undefined = loading, null = not found
  const [q, setQ] = useState("");
  const [qty, setQty] = useState(1);

  // корзина
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useLocalStorage<any[]>("cart", []);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  useEffect(() => {
    setProd(undefined);
    fetch(`/api/products/${params.id}`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setProd(data))
      .catch(() => setProd(null));
  }, [params.id]);

  function addToCart() {
    if (!prod) return;
    setCart((prev) => {
      const ex = prev.find((x: any) => x.id === prod.id);
      return ex
        ? prev.map((x: any) =>
            x.id === prod.id ? { ...x, qty: x.qty + qty } : x
          )
        : [...prev, { ...prod, qty }];
    });
    setCartOpen(true);
  }

  function buyNow() {
    if (!prod) return;
    // добавляем выбранное количество и сразу на оформление
    setCart((prev) => {
      const ex = prev.find((x: any) => x.id === prod.id);
      const next = ex
        ? prev.map((x: any) =>
            x.id === prod.id ? { ...x, qty: x.qty + qty } : x
          )
        : [...prev, { ...prod, qty }];
      return next;
    });
    router.push("/checkout");
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((x: any) =>
        x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x
      )
    );
  }
  function removeItem(id: string) {
    setCart((prev) => prev.filter((x: any) => x.id !== id));
  }

  // “похожие” по первому тегу
  const [related, setRelated] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (!prod) return;
      const all = await fetch("/api/products").then((r) => r.json());
      const tag0 = (prod.tags?.[0] || "").toLowerCase();
      const rel = all
        .filter(
          (p: any) =>
            p.id !== prod.id &&
            (p.tags || []).some((t: string) => t.toLowerCase() === tag0)
        )
        .slice(0, 3);
      setRelated(rel);
    })();
  }, [prod]);

  return (
    <>
      <Navbar
        q={q}
        onSearch={setQ}
        onCartOpen={() => setCartOpen(true)}
        cartCount={count}
        total={total}
      />

      <main className="container py-6">
        {/* хлебные крошки */}
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            Каталог
          </Link>{" "}
          / <span className="text-gray-700">Товар</span>
        </nav>

        {prod === undefined ? (
          <div className="text-gray-500">Загрузка…</div>
        ) : prod === null ? (
          <div className="text-gray-500">
            Товар не найден.{" "}
            <Link href="/" className="underline">
              Вернуться в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Левая колонка: фото/характеристики */}
            <section className="lg:col-span-7">
              <div className="card-soft overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full aspect-video object-cover"
                />
              </div>

              {prod.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {prod.tags.map((t: string) => (
                    <span key={t} className="badge">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {prod.features?.length > 0 && (
                <div className="mt-6 card-soft p-5">
                  <h3 className="font-semibold mb-2">Характеристики</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {prod.features.map((f: string) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Правая колонка: липкий блок покупки */}
            <aside className="lg:col-span-5">
              <div className="sticky top-20 space-y-4">
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:underline inline-flex items-center gap-1"
                >
                  ← назад к каталогу
                </Link>

                <h1 className="text-2xl md:text-3xl font-bold">{prod.name}</h1>
                <div className="price">{currency(prod.price)}</div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Количество</span>
                  <div className="inline-flex items-center gap-2">
                    <button
                      className="btn-outline"
                      onClick={() => setQty((v) => Math.max(1, v - 1))}
                    >
                      –
                    </button>
                    <span className="min-w-[2ch] text-center">{qty}</span>
                    <button
                      className="btn-outline"
                      onClick={() => setQty((v) => v + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="btn-primary w-full sm:w-auto"
                    onClick={addToCart}
                  >
                    В корзину
                  </button>
                  <button
                    className="btn-outline w-full sm:w-auto"
                    onClick={buyNow}
                  >
                    Купить сейчас
                  </button>
                  <button
                    className="btn-outline w-full sm:w-auto"
                    onClick={() => setCartOpen(true)}
                  >
                    Открыть корзину
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  Доставка по РУз 1–3 дня • Гарантия 12 мес • Скидки от 10 шт
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Похожие товары */}
        {related.length > 0 && (
          <section className="mt-10">
            <h3 className="font-semibold mb-3">Похожие товары</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="card-soft p-4 hover:shadow-lg transition block"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <div className="mt-2 flex items-start justify-between">
                    <div className="font-medium">{p.name}</div>
                    <div className="font-semibold">{currency(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        changeQty={changeQty}
        removeItem={removeItem}
        // из дроверa тоже ведём на оформление
        checkout={() => router.push("/checkout")}
      />
    </>
  );
}
