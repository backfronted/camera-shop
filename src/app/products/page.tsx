"use client";
import useSWR from "swr";
import Link from "next/link";
const fetcher = (u:string)=>fetch(u).then(r=>r.json());
const currency = (n:number)=>new Intl.NumberFormat("ru-RU").format(n);

export default function ProductsPage(){
  const { data: products = [] } = useSWR("/api/products", fetcher);
  return (
    <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((p:any)=>(
        <article key={p.id} className="bg-white rounded-2xl shadow p-4">
          <Link href={`/products/${p.id}`}><img src={p.image} alt={p.name} className="w-full aspect-video object-cover rounded-xl" /></Link>
          <div className="flex items-start justify-between mt-2">
            <Link href={`/products/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
            <div className="font-bold">{currency(p.price)}</div>
          </div>
          {p.tags?.length>0 && <div className="mt-1 text-sm text-gray-600">{p.tags.slice(0,3).join(", ")}</div>}
          <Link href={`/products/${p.id}`} className="inline-block mt-3 px-4 py-2 rounded-xl bg-black text-white">Подробнее</Link>
        </article>
      ))}
    </main>
  );
}
