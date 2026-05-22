"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/dashboard/formatPrice";
import { Icon } from "@/components/ui/Icon";
import { Product, ProductVariant } from "@/type/index";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);
  const cartItem = cartItems.find(
    (item) =>
      item.product.id === id && item.variant?.id === selectedVariant?.id,
  );

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      // Fetch product
      const { data: productData, error: productError } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

      if (productError || !productData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(productData);

      // Fetch variants
      const { data: variantsData } = await supabaseClient
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .order("size", { ascending: true });

      setVariants(variantsData || []);

      // Auto select first available variant
      if (variantsData && variantsData.length > 0) {
        setSelectedVariant(variantsData[0]);
      }

      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Realtime stock update untuk variants
  // Realtime stock update untuk variants
  useEffect(() => {
    if (!id) return;

    // Subscribe ke perubahan di tabel product_variants
    const channel = supabaseClient
      .channel(`product-variants-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "product_variants",
          filter: `product_id=eq.${id}`,
        },
        (payload) => {
          console.log("🔴 Real-time update received:", payload);

          // Update variants list
          setVariants((prev) =>
            prev.map((v) =>
              v.id === payload.new.id ? { ...v, stock: payload.new.stock } : v,
            ),
          );

          // Update selected variant if needed
          setSelectedVariant((prev) => {
            if (!prev || prev.id !== payload.new.id) return prev;
            return { ...prev, stock: payload.new.stock };
          });
        },
      )
      .subscribe((status) => {
        console.log("🟢 Subscription status:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || selectedVariant.stock === 0) return;

    await addToCart(product, selectedVariant);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const isOutOfStock = selectedVariant?.stock === 0;
  const isMaxInCart =
    cartItem !== undefined &&
    cartItem.quantity >= (selectedVariant?.stock || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5fbf5] pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 mb-8 lg:mb-0">
            <div className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <div className="lg:col-span-5 space-y-4 pt-2">
            <div className="h-6 bg-slate-100 rounded-full w-1/3 animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-lg w-3/4 animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-5 bg-[#f5fbf5]">
        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
          <Icon name="warning" className="w-10 h-10 text-slate-300" />
        </div>
        <div>
          <p className="text-xl font-extrabold text-slate-800 tracking-tight">
            Produk tidak ditemukan
          </p>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Produk mungkin sudah dihapus atau tidak tersedia
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 rounded-full bg-[#006948] text-white text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Kembali
        </button>
      </div>
    );
  }

  const thumbnails = [product.image_url].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f5fbf5] pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest"
        >
          <Icon name="arrow_back" className="w-3.5 h-3.5" />
          Kembali
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5 lg:grid lg:grid-cols-12 lg:gap-8 lg:pt-6">
        {/* Image Section */}
        <section className="lg:col-span-7 mb-8 lg:mb-0">
          <div className="relative aspect-[5/4] rounded-xl overflow-hidden bg-[#e9efe9] shadow-[0_20px_40px_-15px_rgba(23,29,25,0.08)] group">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-12 transition-all duration-700 group-hover:scale-105"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon
                  name="shopping_bag"
                  className="w-24 h-24 text-slate-200"
                />
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                <span className="bg-white/90 text-slate-700 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest shadow">
                  Stok Habis
                </span>
              </div>
            )}
          </div>

          {thumbnails.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {thumbnails.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                    activeThumb === i
                      ? "border-2 border-[#006948] shadow-md"
                      : "border border-[#bccac0] opacity-70 hover:opacity-100"
                  }`}
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Icon name="image" className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.category && (
              <span className="bg-[#85f8c4] text-[#002114] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                {product.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-[40px] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <p className="text-3xl font-extrabold text-slate-900">
              {formatPrice(product.price)}
            </p>
          </div>

          {product.description && (
            <p className="text-[17px] text-[#3d4a42] leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Size Selection */}
          {variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Pilih Ukuran
              </label>
              <div className="grid grid-cols-5 gap-3">
                {variants.map((variant) => {
                  const isAvailable = variant.stock > 0;
                  const isSelected = selectedVariant?.id === variant.id;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!isAvailable}
                      className={`
                        h-14 rounded-xl border text-lg font-semibold transition-all
                        ${
                          isSelected
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : isAvailable
                              ? "bg-white text-slate-900 border-slate-300 hover:border-emerald-500"
                              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        }
                      `}
                    >
                      {variant.size}
                      {!isAvailable && (
                        <span className="block text-[10px]">Habis</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedVariant &&
                selectedVariant.stock <= 5 &&
                selectedVariant.stock > 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Sisa {selectedVariant.stock} unit saja!
                  </p>
                )}
            </div>
          )}

          {cartItem && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-6">
              <Icon
                name="shopping_cart"
                className="w-4 h-4 text-[#006948] flex-shrink-0"
              />
              <p className="text-sm text-emerald-800 font-medium">
                <span className="font-bold">{cartItem.quantity} item</span>{" "}
                sudah ada di keranjang
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="hidden md:block">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isMaxInCart || !selectedVariant}
              className={`w-full h-14 rounded-full text-base font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 shadow-[0_20px_40px_-15px_rgba(0,105,72,0.35)]
                ${
                  addedFeedback
                    ? "bg-emerald-500 text-white scale-[0.99]"
                    : isOutOfStock || isMaxInCart || !selectedVariant
                      ? "bg-[#dee4de] text-[#6d7a72] cursor-not-allowed shadow-none"
                      : "bg-[#006948] text-white hover:opacity-90 active:scale-[0.98]"
                }`}
            >
              {addedFeedback ? (
                <>
                  <Icon name="check" className="w-5 h-5" />
                  Ditambahkan!
                </>
              ) : isOutOfStock ? (
                "Stok Habis"
              ) : isMaxInCart ? (
                "Sudah Maksimal di Keranjang"
              ) : !selectedVariant ? (
                "Pilih Ukuran"
              ) : (
                <>
                  <Icon name="shopping_cart" className="w-5 h-5" />
                  Tambah ke Keranjang
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
            {product.name}
          </p>
          <p className="text-xl font-extrabold text-slate-900 leading-tight">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxInCart || !selectedVariant}
          className={`flex-[2] h-14 rounded-full text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_20px_40px_-15px_rgba(0,105,72,0.35)]
            ${
              addedFeedback
                ? "bg-emerald-500 text-white scale-[0.98]"
                : isOutOfStock || isMaxInCart || !selectedVariant
                  ? "bg-[#dee4de] text-[#6d7a72] cursor-not-allowed shadow-none"
                  : "bg-[#006948] text-white"
            }`}
        >
          {addedFeedback ? (
            <>
              <Icon name="check" className="w-4 h-4" />
              Ditambahkan!
            </>
          ) : isOutOfStock ? (
            "Stok Habis"
          ) : isMaxInCart ? (
            "Maksimal"
          ) : !selectedVariant ? (
            "Pilih Ukuran"
          ) : (
            <>
              <Icon name="shopping_cart" className="w-4 h-4" />
              Tambah
            </>
          )}
        </button>
      </div>
    </div>
  );
}
