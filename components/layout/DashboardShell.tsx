"use client";

import { usePathname } from "next/navigation";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { UserSidebar } from "@/components/layout/UserSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideBottomNav =
    pathname.startsWith("/dashboard/product/") ||
    pathname.startsWith("/dashboard/checkout");

  return (
    <div className="bg-[#f5fbf5] min-h-screen">
      <StoreHeader />

      <div className="flex pt-16">
        {/* Sidebar Desktop - di samping kiri, tidak fixed */}
        <div className="hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content - mengambil sisa ruang */}
        <main
          className={`flex-1 ${hideBottomNav ? "pb-16 lg:pb-8" : "pb-24 lg:pb-8"}`}
        >
          {children}
        </main>
      </div>

      {!hideBottomNav && <BottomNav active={pathname} />}
    </div>
  );
}
