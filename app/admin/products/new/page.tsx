"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { AdminSidebar } from "../../components/AdminSidebar";
import { ProductForm } from "../components/ProductForm";
import { ProductFormSkeleton } from "../components/ProductFormSkeleton";
import { Icon } from "@/components/ui/Icon";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      router.push("/auth");
      return;
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen">
        <AdminSidebar />
        <main className="lg:pl-64 pt-16 lg:pt-0">
          <ProductFormSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f5fbf5] min-h-screen">
      <AdminSidebar />
      <header className="lg:hidden fixed top-0 w-full z-50 h-16 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <button className="text-emerald-600 active:scale-95 transition-transform">
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <span className="text-xl font-black italic text-slate-900 tracking-tight">
            QuickShop
          </span>
        </div>
      </header>

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Tambah Produk
            </h1>
            <p className="text-slate-500 mt-1">
              Isi form berikut untuk menambah produk baru
            </p>
          </div>
          <ProductForm mode="create" />
        </div>
      </main>
    </div>
  );
}
