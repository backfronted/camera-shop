"use client";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useLocalStorage } from "@/lib/useLocalStorage";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

const fetcher = (u: string) => fetch(u).then((r) => r.json());
const currency = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export default function Home() {
  const router = useRouter();

  const { data: products = [] } = useSWR("/api/products", fetcher);

  // --- фильтры
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("Все");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  useEffect(() => {
    if (products.length) {
      const prices = products.map((p: any) => p.price);
      setMinPrice(Math.min(...prices));
      setMaxPrice(Math.max(...prices));
    }
  }, [products]);

  const tags: string[] = useMemo(() => {
    const t = new Set<string>();
    products.forEach((p: any) =>
      (p.tags || []).forEach((x: string) => t.add(x))
    );
    return ["Все", ...Array.from(t)];
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p: any) =>
          (tag === "Все" || (p.tags || []).includes(tag)) &&
          p.price >= minPrice &&
          p.price <= maxPrice &&
          p.name.toLowerCase().includes(q.toLowerCase())
      ),
    [products, q, tag, minPrice, maxPrice]
  );

  // --- корзина
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useLocalStorage<any[]>("cart", []);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  function add(p: any) {
    setCart((prev) => {
      const ex = prev.find((x: any) => x.id === p.id);
      return ex
        ? prev.map((x: any) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
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
  async function checkout() {
    router.push("/checkout");
  }

  return (
    <>
      <Navbar
        q={q}
        onSearch={setQ}
        onCartOpen={() => setCartOpen(true)}
        cartCount={count}
        total={total}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="rounded-3xl bg-black text-white p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">
              Гаджеты оптом и в розницу
            </h1>
            <p className="text-white/80 mt-3">
              Wi-Fi • AHD • Комплекты NVR. Гарантия 2 мес.
            </p>
          </div>
          <img
            className="flex-1 w-full rounded-2xl size-44 object-cover"
            src="https://cdn.media.amplience.net/i/canon/eos-r7_eos-r10_eosr_system_all_black_9597a82eeee44ddfb76bf948b33470d0?$hero-header-half-16by9-dt-jpg$"
            alt="CCTV"
          />
        </section>

        {/* Фильтры */}
        <section className="card flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-3 py-1.5 rounded-full border ${
                  tag === t
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="md:ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Цена от</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                className="input w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">до</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                className="input w-28"
              />
            </div>
          </div>
        </section>

        {/* Сетка товаров */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p: any) => (
            <article key={p.id} className="card hover:shadow-lg transition">
              <Link href={`/products/${p.id}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full aspect-video object-cover rounded-xl"
                />
              </Link>
              <div className="flex items-start justify-between mt-2">
                <div>
                  <Link
                    href={`/products/${p.id}`}
                    className="font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  {p.tags?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {p.tags.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-xs bg-gray-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="font-bold tabular-nums">
                  {currency(p.price)}
                </div>
              </div>
              <button className="btn mt-3" onClick={() => add(p)}>
                В корзину
              </button>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="text-gray-600">
              Ничего не найдено. Попробуйте изменить фильтры.
            </div>
          )}
        </section>

        <Footer />
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        changeQty={changeQty}
        removeItem={removeItem}
        checkout={checkout}
      />
    </>
  );
}
