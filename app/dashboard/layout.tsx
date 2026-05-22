"use client";

import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useCartStore } from "@/store/cartStore";
import { supabaseClient } from "@/lib/supabaseClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchCart, clearCart } = useCartStore();

  useEffect(() => {
    const initCart = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (user) {
        await fetchCart(); // Ambil cart dari database
      } else {
        await clearCart(); // Kosongkan cart jika tidak login
      }
    };

    initCart();

    // Subscribe ke perubahan auth (login/logout)
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        await fetchCart();
      } else if (event === "SIGNED_OUT") {
        await clearCart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCart, clearCart]);

  return <DashboardShell>{children}</DashboardShell>;
}
