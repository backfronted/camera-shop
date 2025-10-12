"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin",           label: "Товары" },
  { href: "/admin/orders",    label: "Заказы" },
  { href: "/admin/analytics", label: "Метрики" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-4 flex flex-wrap gap-2">
      {tabs.map(t => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={
              "px-3 py-1.5 rounded-full border text-sm " +
              (active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
