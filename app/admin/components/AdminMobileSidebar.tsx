"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { supabaseClient } from "@/lib/supabaseClient";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "inventory_2", label: "Inventory", href: "/admin/products" },
  { icon: "receipt_long", label: "Orders", href: "/admin/orders" },
  { icon: "group", label: "Customers", href: "#" },
  { icon: "settings", label: "Settings", href: "#" },
];

type AdminMobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminMobileSidebar({
  isOpen,
  onClose,
}: AdminMobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
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
            <p className="text-[10px] text-slate-400 mt-0.5">Admin Panel</p>
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
            const isActive =
              pathname === href ||
              (href !== "/admin" && pathname?.startsWith(href));

            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                <Icon name={icon} className="w-5 h-5" />
                <span className="font-medium">{label}</span>
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
            © 2024 ZeepStep
          </p>
        </div>
      </div>
    </>
  );
}
