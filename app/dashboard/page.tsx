"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Product } from "@/type/index";
import { HeroSection } from "@/components/store/HeroSection";
import { CategoryFilter } from "@/components/store/CategoryFilter";
import { ProductGrid } from "@/components/store/ProductGrid";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabaseClient
      .from("products")
      .select(
        `
      id,
      name,
      description,
      price,
      image_url,
      category,
      created_at,
      product_variants (id, size, stock)
    `,
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(8);

    if (activeCategory !== "All") {
      query = query.ilike("category", activeCategory);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) setError("Gagal memuat produk. Coba lagi.");
    else setProducts(data ?? []);

    setLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="w-full">
      <HeroSection />
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      <section className="mt-6 md:mt-8 px-4 md:px-6 pb-24 md:pb-8">
        <div className="flex justify-between items-end mb-4 md:mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            New Arrivals
          </h3>
          <span className="text-emerald-700 text-xs md:text-sm font-bold uppercase tracking-widest cursor-pointer hover:underline">
            View All
          </span>
        </div>
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onRetry={fetchProducts}
        />
      </section>
    </div>
  );
}
