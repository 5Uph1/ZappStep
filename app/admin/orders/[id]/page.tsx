"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { AdminSidebar } from "../../components/AdminSidebar";
import { OrderDetailHeader } from "../../components/OrderDetailHeader";
import { OrderStatusSection } from "../../components/OrderStatusSection";
import { OrderTrackingSection } from "../../components/OrderTrackingSection";
import { OrderCustomerInfo } from "../../components/OrderCustomerInfo";
import { OrderItemsList } from "../../components/OrderItemsList";
import { STATUS_CONFIG } from "../../components/StatusBadge";
import { Icon } from "@/components/ui/Icon";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  products: { name: string; image_url: string | null } | null;
};

type Order = {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
  shipping_address: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancel_requested: boolean;
  cancel_requested_at: string | null;
  cancel_reason: string | null;
  profiles: { email: string } | null;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [processingCancel, setProcessingCancel] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);

    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError) {
      router.push("/admin/orders");
      return;
    }

    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("email")
      .eq("id", orderData.user_id)
      .maybeSingle();

    setOrder({ ...orderData, profiles: profileData || null });
    setTrackingNumber(orderData.tracking_number || "");

    const { data: itemsData, error: itemsError } = await supabaseClient
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    if (!itemsError && itemsData && itemsData.length > 0) {
      const itemsWithProducts = await Promise.all(
        itemsData.map(async (item) => {
          const { data: productData } = await supabaseClient
            .from("products")
            .select("name, image_url")
            .eq("id", item.product_id)
            .maybeSingle();
          return {
            ...item,
            products: productData || null,
            size: item.size,
          };
        }),
      );
      setItems(itemsWithProducts as OrderItem[]);
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);

    const updateData: any = { status: newStatus };
    if (newStatus === "shipped" && !order.shipped_at)
      updateData.shipped_at = new Date().toISOString();
    if (newStatus === "delivered" && !order.delivered_at)
      updateData.delivered_at = new Date().toISOString();

    const { error } = await supabaseClient
      .from("orders")
      .update(updateData)
      .eq("id", order.id);
    if (error) {
      alert("Gagal mengupdate status order");
    } else {
      setOrder({ ...order, ...updateData });
    }
    setUpdating(false);
  };

  const handleUpdateTracking = async () => {
    if (!order) return;
    setUpdating(true);

    const { error } = await supabaseClient
      .from("orders")
      .update({ tracking_number: trackingNumber })
      .eq("id", order.id);
    if (error) {
      alert("Gagal mengupdate nomor resi");
    } else {
      setOrder({ ...order, tracking_number: trackingNumber });
      alert("Nomor resi berhasil diupdate");
    }
    setUpdating(false);
  };

  // ── Konfirmasi Cancel (Setujui pembatalan) ─────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!order) return;
    setProcessingCancel(true);

    // 1. Ambil order items untuk mengetahui variant dan quantity
    const { data: orderItems } = await supabaseClient
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", order.id);

    // 2. Kembalikan stock ke masing-masing variant
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        const { data: variant } = await supabaseClient
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          const newStock = variant.stock + item.quantity;
          await supabaseClient
            .from("product_variants")
            .update({ stock: newStock })
            .eq("id", item.variant_id);

          console.log(
            `Restored stock for variant ${item.variant_id}: +${item.quantity} -> ${newStock}`,
          );
        }
      }
    }

    // 3. Update status order menjadi cancelled
    const { error } = await supabaseClient
      .from("orders")
      .update({
        status: "cancelled",
        cancel_requested: false,
        cancel_reason: null,
      })
      .eq("id", order.id);

    if (error) {
      alert("Gagal membatalkan order: " + error.message);
    } else {
      alert("Order berhasil dibatalkan. Stock telah dikembalikan.");
      fetchOrderDetail(); // Refresh
    }
    setProcessingCancel(false);
  };

  // ── Tolak Cancel (Tolak pembatalan, lanjutkan order) ──────────────────────
  const handleRejectCancel = async () => {
    if (!order) return;
    setProcessingCancel(true);

    const { error } = await supabaseClient
      .from("orders")
      .update({
        cancel_requested: false,
        cancel_reason: null,
        status: "paid", // Kembalikan ke status paid (karena cancel request hanya dari status paid/processing/packed)
      })
      .eq("id", order.id);

    if (error) {
      alert("Gagal menolak pembatalan: " + error.message);
    } else {
      alert("Request pembatalan ditolak. Order dilanjutkan.");
      fetchOrderDetail();
    }
    setProcessingCancel(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => `Rp ${price.toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="max-w-4xl mx-auto p-8">
            <p className="text-slate-500">Loading order detail...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="max-w-4xl mx-auto p-8">
            <p className="text-slate-500">Order tidak ditemukan.</p>
          </div>
        </main>
      </div>
    );
  }

  const currentStatusConfig = STATUS_CONFIG[order.status];
  const availableNextStatuses = currentStatusConfig?.next || [];
  const hasCancelRequest =
    order.cancel_requested && order.status === "cancelling";

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
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
          <OrderDetailHeader
            orderId={order.id}
            createdAt={order.created_at}
            status={order.status}
            formatDate={formatDate}
          />

          {/* ── Cancel Request Card (jika ada request cancel) ────────────────── */}
          {hasCancelRequest && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-orange-800 text-lg">
                    Request Pembatalan Order
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Customer meminta pembatalan order ini.
                  </p>
                  {order.cancel_reason && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg">
                      <p className="text-xs font-semibold text-orange-800 uppercase tracking-wider">
                        Alasan Customer:
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {order.cancel_reason}
                      </p>
                    </div>
                  )}
                  {order.cancel_requested_at && (
                    <p className="text-xs text-orange-600 mt-2">
                      Dikirim pada: {formatDate(order.cancel_requested_at)}
                    </p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleConfirmCancel}
                      disabled={processingCancel}
                      className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingCancel ? (
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
                      ) : (
                        "✅"
                      )}
                      Konfirmasi Batalkan
                    </button>
                    <button
                      onClick={handleRejectCancel}
                      disabled={processingCancel}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      ❌ Tolak, Lanjutkan Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <OrderStatusSection
            currentStatus={order.status}
            availableNextStatuses={availableNextStatuses}
            onUpdateStatus={handleUpdateStatus}
            updating={updating}
          />

          <OrderTrackingSection
            trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            shippingAddress={order.shipping_address}
            shippedAt={order.shipped_at}
            deliveredAt={order.delivered_at}
            onUpdateTracking={handleUpdateTracking}
            updating={updating}
            formatDate={formatDate}
          />

          <OrderCustomerInfo
            email={order.profiles?.email || null}
            userId={order.user_id}
          />

          <OrderItemsList items={items} formatPrice={formatPrice} />
        </div>
      </main>
    </div>
  );
}
