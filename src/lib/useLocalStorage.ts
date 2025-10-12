"use client";
import { useEffect, useState } from "react";

/**
 * Надёжный хук для Next.js (App Router):
 * - не читает localStorage на сервере
 * - инициализируется в useEffect
 * - переживает JSON-ошибки
 * - синхронизируется между вкладками
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState<T>(initialValue);

  // Инициализация из localStorage — только на клиенте
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined"
        ? window.localStorage.getItem(key)
        : null;
      if (raw !== null) {
        setValue(JSON.parse(raw));
      } else if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch {
      // если битый JSON — просто оставим initialValue
    }
    setReady(true);
  }, [key]);

  // Запись в localStorage после инициализации
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, ready]);

  // Синхронизация между вкладками
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        setValue(JSON.parse(e.newValue));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, setValue] as const;
}
