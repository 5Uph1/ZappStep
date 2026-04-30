"use client";

import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabaseClient.auth.getUser();

      if (data.user) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    };

    checkUser();
  }, [router]);

  return <h1>loading...</h1>;
}
