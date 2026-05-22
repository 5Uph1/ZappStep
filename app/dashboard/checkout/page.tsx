"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { supabaseClient } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/dashboard/formatPrice";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: unknown) => void;
          onPending: (result: unknown) => void;
          onError: (result: unknown) => void;
          onClose: () => void;
        },
      ) => void;
    };
  }
}

function CheckoutContent() {
  const router = useRouter();
  const { items, totalPrice, clearCart, removeFromCart } = useCartStore();

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "true";

  // ── Redirect kalau cart kosong ────────────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/dashboard");
    }
  }, [items, router]);

  // ── Ambil data user yang login ────────────────────────────────────────────
  useEffect(() => {
    const getUser = async () => {
      setLoadingUser(true);
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (session?.user) {
        setUserEmail(session.user.email ?? "");
        setUserName(session.user.user_metadata?.full_name ?? "");
      }
      setLoadingUser(false);
    };

    getUser();
  }, [router]);

  // ── Load Midtrans Snap script ─────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    );
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ── Handle checkout ───────────────────────────────────────────────────────
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!shippingAddress.trim()) {
      setErrorMsg("Alamat pengiriman wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      // ── CEK STOK SEBELUM CHECKOUT (CEK KE VARIANT) ───────────────────────────
      const variantIds = items.map((item) => item.variant.id);

      const { data: variants, error: stockError } = await supabaseClient
        .from("product_variants")
        .select("id, product_id, size, stock")
        .in("id", variantIds);

      if (stockError) {
        console.error("Stock check error:", stockError);
        setErrorMsg("Gagal mengecek stok. Coba lagi.");
        setLoading(false);
        return;
      }

      // Filter item yang valid dan hapus yang tidak valid dari cart
      const validItems = [];
      for (const item of items) {
        const variant = variants?.find((v) => v.id === item.variant.id);
        if (!variant) {
          console.warn(
            `Item ${item.product.name} tidak ditemukan, menghapus dari cart`,
          );
          // Hapus item yang tidak valid dari cart
          await removeFromCart(item.product.id, item.variant.id);
          continue;
        }

        if (variant.stock < item.quantity) {
          setErrorMsg(
            `Stok ${item.product.name} ukuran ${variant.size} tidak mencukupi. Tersisa ${variant.stock} unit.`,
          );
          setLoading(false);
          return;
        }

        validItems.push({
          ...item,
          variantStock: variant.stock,
        });
      }

      if (validItems.length === 0) {
        setErrorMsg(
          "Keranjang kosong atau berisi produk yang sudah tidak tersedia. Silakan refresh halaman.",
        );
        setLoading(false);
        return;
      }

      console.log("Stock check passed!", {
        validItemsCount: validItems.length,
      });

      // Hitung ulang total price berdasarkan validItems
      const newTotalPrice = validItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      );

      // 1. Hit API route → buat order + generate Midtrans token
      const response = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validItems.map((item) => ({
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
            },
            variant: {
              id: item.variant.id,
              size: item.variant.size,
            },
            quantity: item.quantity,
          })),
          totalPrice: newTotalPrice,
          shippingAddress: shippingAddress.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error ?? "Terjadi kesalahan. Coba lagi.");
        setLoading(false);
        return;
      }

      // 2. Buka Midtrans Snap popup
      window.snap.pay(data.token, {
        onSuccess: () => {
          clearCart();
          router.push("/dashboard/orders?from=payment");
        },
        onPending: () => {
          clearCart();
          router.push("/dashboard/orders?from=payment");
        },
        onError: () => {
          setErrorMsg("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMsg("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="pb-32 px-5 pt-4">
      {/* ── Back button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <Icon name="arrow_back" className="w-4 h-4" />
        Kembali
      </button>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Checkout</h1>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {errorMsg}
        </div>
      )}

      {/* ── Pending banner ─────────────────────────────────────────────────── */}
      {isPending && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 mb-4">
          Pembayaran kamu sedang menunggu konfirmasi. Cek email untuk instruksi
          pembayaran.
        </div>
      )}

      {/* ── Ringkasan order ───────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">
          Ringkasan Pesanan
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
          {items.map(({ product, variant, quantity }) => (
            <div
              key={`${product.id}-${variant.id}`}
              className="flex items-center gap-4 p-4"
            >
              {/* Gambar */}
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      name="shopping_bag"
                      className="w-8 h-8 text-slate-300"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ukuran: {variant.size} | {quantity} x{" "}
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Subtotal per item */}
              <p className="text-sm font-bold text-emerald-700 flex-shrink-0">
                {formatPrice(product.price * quantity)}
              </p>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-b-2xl">
            <span className="text-sm font-bold text-slate-700">Total</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatPrice(totalPrice())}
            </span>
          </div>
        </div>
      </section>

      {/* ── Form pengiriman ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">
          Informasi Pengiriman
        </h2>
        <form onSubmit={handleCheckout} className="space-y-4">
          {/* Nama */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Nama
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nama lengkap"
              required
              className="w-full h-12 px-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-sm transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              readOnly
              className="w-full h-12 px-4 rounded-xl bg-slate-100 ring-1 ring-slate-200 outline-none text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Alamat pengiriman */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Alamat Pengiriman
            </label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Jl. Contoh No. 123, Kota, 12345"
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-sm transition-all resize-none"
            />
            <p className="text-xs text-slate-400">
              Format: Alamat lengkap, Kota, Kode Pos
            </p>
          </div>

          {/* Tombol bayar — fixed di bawah */}
          <div className="fixed bottom-20 md:bottom-0 left-0 right-0 px-5 py-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Pembayaran</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatPrice(totalPrice())}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <Icon name="payment" className="w-4 h-4" />
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
