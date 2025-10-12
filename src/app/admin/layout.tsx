import AdminNav from "@/components/AdminNav";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Админка</h1>
      </div>
      <AdminNav />
      {children}
    </main>
  );
}
