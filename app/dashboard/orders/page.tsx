"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/dashboard/formatPrice";
import { Icon } from "@/components/ui/Icon";
import { useCartStore } from "@/store/cartStore";
import { Order, OrderItem } from "@/type/index";
import { Suspense } from "react";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order["status"] }) {
  const config: Record<string, { label: string; className: string }> = {
    unpaid: {
      label: "Menunggu Pembayaran",
      className: "bg-amber-50 text-amber-700",
    },
    paid: { label: "Dibayar", className: "bg-blue-50 text-blue-700" },
    processing: {
      label: "Diproses",
      className: "bg-indigo-50 text-indigo-700",
    },
    packed: { label: "Dikemas", className: "bg-purple-50 text-purple-700" },
    shipped: { label: "Dikirim", className: "bg-emerald-50 text-emerald-700" },
    delivered: { label: "Selesai", className: "bg-green-100 text-green-700" },
    cancelled: { label: "Dibatalkan", className: "bg-red-50 text-red-600" },
    cancelling: {
      label: "Menunggu Konfirmasi Cancel",
      className: "bg-orange-50 text-orange-600",
    },
  };

  const { label, className } = config[status] || config.unpaid;
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  );
}

// ── Format tanggal ────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPayment = searchParams.get("from") === "payment";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [repayingId, setRepayingId] = useState<string | null>(null);

  // State untuk cancel request
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // ── Handle repay ──────────────────────────────────────────────────────────
  const handleRepay = async (
    e: React.MouseEvent<HTMLButtonElement>,
    orderId: string,
  ) => {
    e.stopPropagation();
    setRepayingId(orderId);
    try {
      const res = await fetch("/api/midtrans/repay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Gagal memproses pembayaran.");
        setRepayingId(null);
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => {
          router.push("/dashboard/orders?from=payment");
        },
        onPending: () => {
          router.push("/dashboard/orders?from=payment");
        },
        onError: () => {
          alert("Pembayaran gagal. Silakan coba lagi.");
          setRepayingId(null);
        },
        onClose: () => {
          setRepayingId(null);
        },
      });
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
      setRepayingId(null);
    }
  };

  // ── Handle request cancel ─────────────────────────────────────────────────
  const handleRequestCancel = async () => {
    if (!cancelOrderId) return;
    setSubmittingCancel(true);

    const { error } = await supabaseClient
      .from("orders")
      .update({
        cancel_requested: true,
        cancel_requested_at: new Date().toISOString(),
        cancel_reason: cancelReason || null,
        status: "cancelling",
      })
      .eq("id", cancelOrderId);

    if (error) {
      alert("Gagal mengirim request cancel: " + error.message);
    } else {
      alert("Request cancel telah dikirim. Admin akan memproses.");
      setCancelOrderId(null);
      setCancelReason("");
      fetchOrders(); // Refresh orders
    }
    setSubmittingCancel(false);
  };

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabaseClient
      .from("orders")
      .select(
        `
          id,
          status,
          total_price,
          shipping_address,
          tracking_number,
          payment_token,
          created_at,
          cancel_requested,
          cancel_requested_at,
          cancel_reason,
          order_items (
            id,
            quantity,
            price,
            size,
            variant_id,
            product:products (
              id,
              name,
              image_url
            )
          )
        `,
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as Order[]);
      if (fromPayment && data.length > 0) {
        setExpandedId(data[0].id);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [fromPayment]);

  // ── Supabase Realtime — subscribe perubahan status order ──────────────────
  useEffect(() => {
    const channel = supabaseClient
      .channel("orders-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id
                ? {
                    ...order,
                    status: payload.new.status,
                    cancel_requested: payload.new.cancel_requested,
                    cancel_reason: payload.new.cancel_reason,
                  }
                : order,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

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

  const toggleExpand = (orderId: string) => {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-5 pt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-2xl p-4 space-y-3 border border-slate-100"
          >
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-32">
      {/* ── Back button ────────────────────────────────────────────────────── */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
      >
        <Icon name="arrow_back" className="w-4 h-4" />
        Kembali
      </button>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
        Pesanan Saya
      </h1>

      {/* ── Banner sukses dari payment ────────────────────────────────────── */}
      {fromPayment && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-6 flex items-center gap-2">
          <Icon name="check" className="w-4 h-4 flex-shrink-0" />
          Pembayaran berhasil! Pesanan kamu sedang diproses.
        </div>
      )}

      {/* ── Realtime indicator ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-400 font-medium">
          Status update otomatis
        </span>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon name="receipt_long" className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <p className="font-bold text-slate-700">Belum ada pesanan</p>
            <p className="text-slate-400 text-sm mt-1">Yuk mulai belanja!</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest"
          >
            Mulai Belanja
          </button>
        </div>
      )}

      {/* ── Order list ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          const canRequestCancel =
            ["paid", "processing", "packed"].includes(order.status) &&
            !order.cancel_requested;
          const isCancelling = order.status === "cancelling";

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* ── Order header — klik untuk expand ───────────────────────── */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatPrice(order.total_price)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <Icon
                  name={isExpanded ? "expand_less" : "expand_more"}
                  className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1"
                />
              </button>

              {/* ── Order detail (accordion) ────────────────────────────────── */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  {/* Items */}
                  <ul className="divide-y divide-slate-100">
                    {(order.order_items || []).map((item: OrderItem) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                          {item.product?.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon
                                name="shopping_bag"
                                className="w-6 h-6 text-slate-300"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {item.product?.name ?? "Produk tidak tersedia"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Ukuran: {item.size || "-"} | {item.quantity} x{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-emerald-700 flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* Footer detail */}
                  <div className="px-4 py-3 bg-slate-50 space-y-2">
                    {order.shipping_address && (
                      <div className="flex items-start gap-2">
                        <Icon
                          name="location_on"
                          className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-slate-500">
                          {order.shipping_address}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-sm font-bold text-slate-700">
                        Total
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatPrice(order.total_price)}
                      </span>
                    </div>

                    {/* Tombol Bayar - hanya untuk status unpaid */}
                    {order.status === "unpaid" && (
                      <button
                        onClick={(e) => handleRepay(e, order.id)}
                        disabled={repayingId === order.id}
                        className="w-full mt-1 h-11 bg-emerald-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {repayingId === order.id ? (
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
                    )}

                    {/* Tombol Cancel Request - untuk status paid, processing, packed */}
                    {canRequestCancel && (
                      <button
                        onClick={() => setCancelOrderId(order.id)}
                        className="w-full mt-1 h-11 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Ajukan Pembatalan
                      </button>
                    )}

                    {/* Status cancelling info */}
                    {isCancelling && (
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          Menunggu konfirmasi admin untuk pembatalan order.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Dialog Request Cancel ─────────────────────────────────────────── */}
      {cancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Ajukan Pembatalan Order
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Apakah Anda yakin ingin membatalkan order ini? Admin akan
              memproses permintaan Anda.
            </p>
            <textarea
              placeholder="Alasan pembatalan (opsional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setCancelOrderId(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleRequestCancel}
                disabled={submittingCancel}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {submittingCancel ? "Memproses..." : "Ya, Ajukan Pembatalan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
