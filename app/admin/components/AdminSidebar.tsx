"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const paths: Record<string, string> = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    inventory_2: "M20 2H4v2l8 5 8-5V2zM4 11v9h16v-9l-8 5-8-5z",
    receipt_long:
      "M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z",
    group:
      "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    settings:
      "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    trending_up:
      "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  };
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={paths[name] ?? ""} />
    </svg>
  );
}

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "inventory_2", label: "Products", href: "/admin/products" },
  { icon: "receipt_long", label: "Orders", href: "/admin/orders" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.refresh();
    router.push("/auth");
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 h-full w-64 border-r border-slate-200 bg-slate-50">
      {/* Brand */}
      <div className="px-6 py-8">
        <h1 className="text-lg font-bold text-slate-900">ZeepStep</h1>
        <p className="text-[12px] font-medium text-slate-500 tracking-wide mt-1">
          Management Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ icon, label, href }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin" && pathname?.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon name={icon} className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
