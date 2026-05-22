"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const NAV_ITEMS = [
  { icon: "home", label: "Home", href: "/dashboard" },
  { icon: "receipt_long", label: "Orders", href: "/dashboard/orders" },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-slate-200 bg-white/80 backdrop-blur-md flex-shrink-0">
      <div className="px-6 py-8">
        <h1 className="text-xl font-black italic text-emerald-700">ZeepStep</h1>
        <p className="text-[11px] font-medium text-slate-400 tracking-wide mt-1">
          Customer Dashboard
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map(({ icon, label, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
              }`}
            >
              <Icon name={icon} className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          © 2026 ZeepStep
        </p>
      </div>
    </aside>
  );
}
