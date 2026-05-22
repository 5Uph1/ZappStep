"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";
import { Icon } from "@/components/ui/Icon";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminMetricsCards } from "./components/AdminMetricsCards";
import { LatestOrdersTable } from "./components/LatestOrdersTable";
import { InventoryList } from "./components/InventoryList";
import { getStatusLabel, getStatusClass } from "./components/StatusBadge";

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    revenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    stockAlerts: 0,
  });
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [lowestStockProducts, setLowestStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // 1. Fetch total revenue
      const { data: revenueData } = await supabaseClient
        .from("orders")
        .select("total_price, created_at, status")
        .in("status", ["paid", "processing", "packed", "shipped", "delivered"]);

      const totalRevenue =
        revenueData?.reduce((sum, order) => sum + order.total_price, 0) || 0;

      // 2. Calculate revenue from last month
      const now = new Date();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const lastMonthRevenue =
        revenueData
          ?.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
          })
          .reduce((sum, order) => sum + order.total_price, 0) || 0;

      const revenueChange =
        lastMonthRevenue === 0
          ? 100
          : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      // 3. Fetch total orders
      const { count: totalOrders } = await supabaseClient
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { count: lastMonthOrders } = await supabaseClient
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString());

      const ordersChange =
        lastMonthOrders === 0
          ? 100
          : (((totalOrders || 0) - (lastMonthOrders || 0)) /
              (lastMonthOrders || 0)) *
            100;

      // 4. Fetch products with their variants to calculate total stock
      const { data: productsWithVariants } = await supabaseClient
        .from("products")
        .select(
          `
            id,
            name,
            image_url,
            is_deleted,
            product_variants (stock)
          `,
        )
        .eq("is_deleted", false);

      // Calculate total stock per product from variants
      const productsWithTotalStock = (productsWithVariants || []).map(
        (product: any) => {
          const variants = product.product_variants || [];
          const totalStock = variants.reduce(
            (sum: number, v: any) => sum + (v.stock || 0),
            0,
          );
          return {
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            totalStock,
          };
        },
      );

      // 5. Get products with lowest stock (for inventory list) - ambil 3 terbawah
      const lowestStockItems = [...productsWithTotalStock]
        .sort((a, b) => a.totalStock - b.totalStock)
        .slice(0, 3);

      // 6. Count products with total stock <= 5 (for stock alert)
      const lowStockCount = productsWithTotalStock.filter(
        (p) => p.totalStock <= 5,
      ).length;

      // 7. Fetch latest 4 orders
      const { data: ordersData } = await supabaseClient
        .from("orders")
        .select("id, total_price, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(4);

      let transformedOrders: any[] = [];

      if (ordersData && ordersData.length > 0) {
        const userIds = [
          ...new Set(ordersData.map((order) => order.user_id).filter(Boolean)),
        ];
        const { data: profilesData } = await supabaseClient
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        const profileMap = new Map();
        profilesData?.forEach((profile) =>
          profileMap.set(profile.id, profile.email),
        );

        transformedOrders = ordersData.map((order: any) => {
          const email = profileMap.get(order.user_id) || "Customer";
          return {
            id: order.id.slice(0, 8),
            customer: email.split("@")[0],
            date: new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            total: `Rp ${order.total_price.toLocaleString("id-ID")}`,
            status: getStatusLabel(order.status),
            statusClass: getStatusClass(order.status),
          };
        });
      }

      // Transform for inventory list (lowest stock products)
      const transformedInventory = lowestStockItems.map((product) => ({
        id: product.id,
        name: product.name,
        stock: `${product.totalStock} unit${product.totalStock !== 1 ? "s" : ""} ${
          product.totalStock <= 5 ? "(LOW)" : ""
        }`,
        stockClass:
          product.totalStock <= 5
            ? "text-xs text-red-600 font-bold"
            : "text-xs text-slate-500",
        image_url: product.image_url,
      }));

      setMetrics({
        revenue: totalRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalOrders: totalOrders || 0,
        ordersChange: Math.round(ordersChange * 10) / 10,
        stockAlerts: lowStockCount || 0,
      });
      setLatestOrders(transformedOrders);
      setLowestStockProducts(transformedInventory);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.refresh();
    router.push("/auth");
  };

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      console.log("Current user:", user?.email);

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .single();

      console.log("Profile data:", profile);
      console.log("Profile role:", profile?.role);
      console.log("Error:", error);

      if (profile?.role !== "admin") {
        console.log("Not admin, redirecting to /dashboard");
        router.replace("/dashboard");
      } else {
        console.log("Admin confirmed, fetching data");
        fetchDashboardData();
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5fbf5] font-sans text-slate-900 min-h-screen selection:bg-emerald-200">
      <AdminSidebar />

      <header className="lg:hidden fixed top-0 w-full z-50 h-16 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <button className="text-emerald-600 active:scale-95 transition-transform">
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <span className="text-xl font-black italic text-slate-900 tracking-tight">
            ZeepStep
          </span>
        </div>
      </header>

      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen bg-[#f5fbf5]">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Dashboard
              </h2>
              <p className="text-slate-500 text-lg mt-1">
                Overview of your store&apos;s performance today.
              </p>
            </div>
          </div>

          <AdminMetricsCards metrics={metrics} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">
                  Latest Orders
                </h3>
                <Link href="/admin/orders">
                  <button className="text-emerald-700 text-xs font-bold uppercase tracking-widest hover:underline">
                    View All
                  </button>
                </Link>
              </div>
              <LatestOrdersTable orders={latestOrders} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Inventory</h3>
                <Link href="/admin/products">
                  <button className="text-emerald-700 text-xs font-bold uppercase tracking-widest hover:underline">
                    View All
                  </button>
                </Link>
              </div>
              <InventoryList products={lowestStockProducts} />
            </section>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { icon: "home", active: true, href: "/admin" },
          { icon: "inventory", label: "Inventory", href: "/admin/products" },
          { icon: "receipt_long", label: "Orders", href: "/admin/orders" },
        ].map(({ icon, active, href }) => (
          <Link
            key={icon}
            href={href}
            className={`flex flex-col items-center justify-center transition-all ${
              active
                ? "text-emerald-500 scale-110"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            <Icon name={icon} className="w-6 h-6" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
