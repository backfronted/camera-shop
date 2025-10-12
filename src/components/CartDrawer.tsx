"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";   // 👈 добавил

const currency = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

type Item = { id: string; name: string; price: number; image: string; qty: number };
type Props = {
  open: boolean;
  onClose: () => void;
  items: Item[];
  changeQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  // checkout: () => void;   👈 убрали, больше не нужно
};

export default function CartDrawer({ open, onClose, items, changeQty, removeItem }: Props) {
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const router = useRouter();   // 👈 для перехода на страницу оформления

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-5 flex flex-col gap-4 transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Корзина</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="text-gray-500">Корзина пуста</div>
        ) : (
          <div className="flex-1 overflow-auto flex flex-col gap-3">
            {items.map(it => (
              <div key={it.id} className="flex gap-3 items-center">
                <img src={it.image} alt={it.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">{currency(it.price)} × {it.qty}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="px-2 py-1 rounded-lg bg-gray-100" onClick={() => changeQty(it.id, -1)}>-</button>
                    <span>{it.qty}</span>
                    <button className="px-2 py-1 rounded-lg bg-gray-100" onClick={() => changeQty(it.id, 1)}>+</button>
                    <button className="ml-3 text-red-600 text-sm" onClick={() => removeItem(it.id)}>Удалить</button>
                  </div>
                </div>
                <div className="font-semibold">{currency(it.price * it.qty)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Итого</span>
            <span className="text-lg font-bold">{currency(total)}</span>
          </div>
          <button
            className="btn w-full"
            disabled={items.length === 0}
            onClick={() => router.push("/checkout")}   // 👈 теперь переход без confirm
          >
            Оформить и оплатить
          </button>
          {/* <p className="text-xs text-gray-500 mt-2">
            Демо: Payme подключим, когда внесём твои ключи мерчанта.
          </p> */}
        </div>
      </aside>
    </div>
  );
}
