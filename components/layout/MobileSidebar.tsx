"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useCartStore } from "@/store/cartStore";
import { supabaseClient } from "@/lib/supabaseClient";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: "home", label: "Home", href: "/dashboard" },
  { icon: "search", label: "Search", href: "/dashboard/search" },
  { icon: "receipt_long", label: "Orders", href: "/dashboard/orders" },
  { icon: "person", label: "Profile", href: "/dashboard/profile" },
];

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    setLoggingOut(true);
    await clearCart();
    await supabaseClient.auth.signOut();
    router.push("/auth");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl flex flex-col animate-in slide-in-from-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-black italic text-emerald-700">
              ZeepStep
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Customer Dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ icon, label, href }) => {
            const isActive = pathname === href;
            const isOrders = icon === "receipt_long";

            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={icon} className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </div>
                {isOrders && itemCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer dengan Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <Icon name="logout" className="w-5 h-5" />
            <span className="font-medium">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-4">
            © 2026 ZeepStep
          </p>
        </div>
      </div>
    </>
  );
}
