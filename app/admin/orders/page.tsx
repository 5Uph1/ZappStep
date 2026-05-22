"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { AdminSidebar } from "../components/AdminSidebar";
import { OrdersFilter } from "../components/OrdersFilter";
import { OrdersTable } from "../components/OrdersTable";
import { Icon } from "@/components/ui/Icon";

type Order = {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
  shipping_address: string | null;
  tracking_number: string | null;
  cancel_requested: boolean;
  cancel_reason: string | null;
  profiles: { email: string } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCancelRequests, setShowCancelRequests] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    setLoading(true);
    setAuthError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    console.log("Session:", session?.user?.email);

    if (sessionError) {
      console.error("Session error:", sessionError);
      setAuthError("Session error: " + sessionError.message);
      setLoading(false);
      return;
    }

    if (!session) {
      console.error("No active session");
      setAuthError("Anda belum login. Silakan login kembali.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    console.log("Profile role:", profile?.role);
    console.log("Profile error:", profileError);

    if (profileError) {
      console.error("Profile error:", profileError);
      setAuthError("Gagal memeriksa role user");
      setLoading(false);
      return;
    }

    if (profile?.role !== "admin") {
      console.log("Not admin, redirecting to /dashboard");
      window.location.href = "/dashboard";
      return;
    }

    console.log("Admin confirmed, fetching orders...");
    await fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithProfiles = await Promise.all(
        ordersData.map(async (order) => {
          const { data: profileData } = await supabaseClient
            .from("profiles")
            .select("email")
            .eq("id", order.user_id)
            .maybeSingle();
          return { ...order, profiles: profileData || null };
        }),
      );

      setOrders(ordersWithProfiles as Order[]);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setAuthError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabaseClient
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      alert(`Gagal mengupdate status order: ${error.message}`);
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
      alert("Status berhasil diupdate!");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    if (showCancelRequests && !order.cancel_requested) return false;
    if (searchTerm) {
      const email = order.profiles?.email?.toLowerCase() || "";
      const orderId = order.id.toLowerCase();
      const term = searchTerm.toLowerCase();
      if (!email.includes(term) && !orderId.includes(term)) return false;
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => `Rp ${price.toLocaleString("id-ID")}`;

  if (authError) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <h2 className="text-red-700 font-bold text-lg mb-2">Error</h2>
              <p className="text-red-600">{authError}</p>
              <button
                onClick={() => (window.location.href = "/admin")}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-bold"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
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
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Orders
                </h1>
                <p className="text-slate-500 mt-1">
                  Kelola semua pesanan customer
                </p>
              </div>

              {/* Tombol Filter Cancel Request */}
              <button
                onClick={() => setShowCancelRequests(!showCancelRequests)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  showCancelRequests
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className="text-base">⏳</span>
                Request Cancel
                {showCancelRequests && <span className="ml-1">✓</span>}
              </button>
            </div>
          </div>

          <OrdersFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={fetchOrders}
          />

          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading orders...</p>
          ) : (
            <OrdersTable
              orders={filteredOrders}
              onUpdateStatus={handleUpdateStatus}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />
          )}
        </div>
      </main>
    </div>
  );
}
