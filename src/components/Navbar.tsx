"use client";

type Props = {
  q: string;
  onSearch: (v: string) => void;
  onCartOpen: () => void;
  cartCount: number;
  total: number;
};

export default function Navbar({
  q,
  onSearch,
  onCartOpen,
  cartCount,
  total,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <a href="/" className="flex items-center gap-2">
          {/* <span className="text-2xl">📷</span> */}
          <span className="font-extrabold text-xl tracking-tight">
            CamZone.uz{" "}
          </span>
        </a>

        <input
          className="input ml-auto w-40 sm:w-72"
          placeholder="Поиск …"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
        />

        <button onClick={onCartOpen} className="relative btn">
          Корзина
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        <div className="hidden sm:block font-semibold tabular-nums">
          Итого: {new Intl.NumberFormat("ru-RU").format(total)}
        </div>
      </div>
    </header>
  );
}
