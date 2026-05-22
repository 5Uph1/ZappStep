"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Icon } from "@/components/ui/Icon";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "../store/CartDrawer";
import { MobileSidebar } from "./MobileSidebar";

export function StoreHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { items, isLoading, clearCart, fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);

    const loadCart = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) {
        await fetchCart();
      }
    };
    loadCart();
  }, [fetchCart]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await clearCart();
    await supabaseClient.auth.signOut();
    router.refresh();
    router.push("/auth");
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-4">
          {/* Tombol Menu - Mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-900 active:scale-95 transition-transform"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <h1
            onClick={() => router.push("/dashboard")}
            className="text-xl font-black italic text-emerald-700 tracking-tight cursor-pointer"
          >
            ZeepStep
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCartOpen(true)}
            className="text-emerald-600 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative">
              <Icon name="shopping_bag" />
              {mounted && !isLoading && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="text-slate-400 cursor-pointer hover:text-red-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {loggingOut ? (
              <svg
                className="animate-spin w-5 h-5"
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
              <Icon name="logout" className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}
