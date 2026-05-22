import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const NAV_ITEMS = [
  { icon: "home", label: "Home", href: "/dashboard" },
  { icon: "receipt_long", label: "Orders", href: "/dashboard/orders" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
      {NAV_ITEMS.map(({ icon, label, href }) => {
        const isActive = active === href;

        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive
                ? "text-emerald-500 scale-110"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            <Icon name={icon} className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-widest mt-1">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
