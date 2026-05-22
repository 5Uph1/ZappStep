"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { AdminSidebar } from "../../../components/AdminSidebar";
import { ProductForm } from "../../components/ProductForm";
import { ProductFormSkeleton } from "../../components/ProductFormSkeleton";
import { Icon } from "@/components/ui/Icon";

type Variant = {
  id?: string;
  size: string;
  stock: number;
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [initialVariants, setInitialVariants] = useState<Variant[]>([]);

  useEffect(() => {
    checkAuthAndFetch();
  }, [id]);

  const checkAuthAndFetch = async () => {
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
    await fetchProduct();
    setLoading(false);
  };

  const fetchProduct = async () => {
    const { data: product } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!product) {
      router.push("/admin/products");
      return;
    }

    setInitialData({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category: product.category ?? "",
      image_url: product.image_url,
    });

    const { data: variantsData } = await supabaseClient
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("size", { ascending: true });

    if (variantsData && variantsData.length > 0) {
      setInitialVariants(
        variantsData.map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
      );
    } else {
      setInitialVariants([{ size: "", stock: 0 }]);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen">
        <AdminSidebar />
        <main className="lg:pl-64 pt-16 lg:pt-0">
          <ProductFormSkeleton />
        </main>
      </div>
    );
  }

  if (!isAdmin || !initialData) {
    return null;
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
              Edit Produk
            </h1>
            <p className="text-slate-500 mt-1">Ubah informasi produk</p>
          </div>
          <ProductForm
            mode="edit"
            productId={id as string}
            initialData={initialData}
            initialVariants={initialVariants}
          />
        </div>
      </main>
    </div>
  );
}
