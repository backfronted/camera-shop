"use client";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  tags: string[] | string;
  features: string[] | string;
  stock: number;
};

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export default function AdminPage() {
  // --- доступ по ключу ---
  const [key, setKey] = useState("");
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const k = localStorage.getItem("ADMIN_KEY") || "";
    setKey(k);
    setOk(!!k);
  }, []);
  function saveKey() {
    const k = key.trim();
    localStorage.setItem("ADMIN_KEY", k);
    setOk(!!k);
  }

  // --- данные ---
  const [items, setItems] = useState<Product[]>([]);
  async function load() {
    const r = await fetch("/api/products");
    const data = await r.json();
    setItems(data);
  }
  useEffect(() => {
    load();
  }, []);

  // --- форма добавления ---
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    tags: "",
    features: "",
    stock: "",
  });

  const canSubmit = useMemo(() => {
    // обязательные поля: name, price, image
    return (
      form.name.trim().length > 1 &&
      Number(form.price) > 0 &&
      form.image.trim().length > 5
    );
  }, [form]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  function normNum(v: string) {
    // только 0..9, пустое допускаем
    return v.replace(/[^\d]/g, "");
  }

  async function create() {
    if (!canSubmit) {
      alert("Заполните: Название, Цена (>0), URL картинки");
      return;
    }
    try {
      const headers: any = {
        "Content-Type": "application/json",
        "x-admin-key": key,
      };
      const body = {
        name: form.name.trim(),
        price: Number(form.price),
        image: form.image.trim(),
        tags: form.tags.trim(), // "Wi-Fi, 2MP"
        features: form.features.trim(), // "1080p, IR"
        stock: form.stock ? Number(form.stock) : 0,
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Создать не удалось (ключ или данные)");
      // очистим форму
      setForm({
        name: "",
        price: "",
        image: "",
        tags: "",
        features: "",
        stock: "",
      });
      await load();
      alert("Товар добавлен ✅");
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  }

  async function update(id: string, patch: Partial<Product>) {
    try {
      const headers: any = {
        "Content-Type": "application/json",
        "x-admin-key": key,
      };
      const body: any = { ...patch };
      if (patch.tags !== undefined)
        body.tags = Array.isArray(patch.tags)
          ? patch.tags.join(",")
          : patch.tags;
      if (patch.features !== undefined)
        body.features = Array.isArray(patch.features)
          ? patch.features.join(",")
          : patch.features;

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Не удалось обновить (ключ?)");
      await load();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить товар?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      if (!res.ok) throw new Error("Не удалось удалить (ключ?)");
      await load();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  }

  // --- экран ввода ключа ---
  if (!ok) {
    return (
      <main className="max-w-lg mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Вход в админку</h1>
        <label className="text-sm text-gray-600">ADMIN_KEY из .env</label>
        <input
          className="input w-full"
          placeholder="например: supersecret123"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button className="btn" onClick={saveKey}>
          Сохранить ключ
        </button>
        <p className="text-sm text-gray-500">
          Ключ хранится локально в вашем браузере. Изменить можно в файле
          <code className="mx-1">.env</code>.
        </p>
      </main>
    );
  }

  // --- UI админки ---
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Админка: товары</h1>

      {/* Форма создания */}
      <section className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Название товара *</label>
            <input
              className="input w-full"
              placeholder="Например: IP-камера 2MP Wi-Fi"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Цена (сум) *</label>
            <input
              className="input w-full"
              inputMode="numeric"
              placeholder="Например: 599000"
              value={form.price}
              onChange={(e) => set("price", normNum(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Количество (шт.)</label>
            <input
              className="input w-full"
              inputMode="numeric"
              placeholder="Например: 10"
              value={form.stock}
              onChange={(e) => set("stock", normNum(e.target.value))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">URL картинки *</label>
            <input
              className="input w-full"
              placeholder="https://... ссылка на фото (Unsplash/Cloudinary/поставщик)"
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Можно вставлять прямой URL — загрузка файлов сделаем позже.
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Теги (через запятую)</label>
            <input
              className="input w-full"
              placeholder="Wi-Fi, 2MP, AHD"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Характеристики (через запятую)
            </label>
            <input
              className="input w-full"
              placeholder="1080p, IR, IP66"
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
            />
          </div>
        </div>

        <button
          className={`btn ${!canSubmit ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={create}
          disabled={!canSubmit}
        >
          Добавить товар
        </button>
        {!canSubmit && (
          <p className="text-xs text-red-500">
            Заполните поля: <b>Название</b>, <b>Цена</b>, <b>URL картинки</b>
          </p>
        )}
      </section>

      {/* Список товаров */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="card p-4 space-y-3">
            <img
              src={p.image}
              className="w-full aspect-video object-cover rounded-xl"
              alt={p.name}
            />
            <div className="flex items-start justify-between">
              <div className="font-semibold">{p.name}</div>
              <div className="font-bold">{fmt(p.price)}</div>
            </div>
            <div className="text-sm text-gray-600">Остаток: {p.stock ?? 0}</div>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn"
                onClick={() => update(p.id, { stock: (p.stock || 0) + 1 })}
              >
                +1 шт
              </button>
              <button
                className="btn"
                onClick={() =>
                  update(p.id, { stock: Math.max(0, (p.stock || 0) - 1) })
                }
              >
                −1 шт
              </button>
              <button
                className="btn"
                onClick={() => update(p.id, { price: p.price + 10000 })}
              >
                +10 000
              </button>
              <button
                className="btn"
                onClick={() =>
                  update(p.id, { price: Math.max(0, p.price - 10000) })
                }
              >
                −10 000
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="btn"
                onClick={() =>
                  update(p.id, {
                    name: prompt("Новое название", p.name) || p.name,
                  })
                }
              >
                Переименовать
              </button>
              <button className="btn" onClick={() => remove(p.id)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
