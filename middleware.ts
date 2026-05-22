import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return request.cookies.get(key)?.value;
        },
        set(key, value, options) {
          request.cookies.set({ name: key, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name: key, value, ...options });
        },
        remove(key, options) {
          request.cookies.set({ name: key, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name: key, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const fromPayment = request.nextUrl.searchParams.get("from") === "payment";

  const isAuthPage = path.startsWith("/auth");
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/admin");

  // Belum login → redirect ke /auth
  if (!user && isProtected && !fromPayment) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Sudah login → tidak perlu ke /auth
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // COMMENT dulu pengecekan role di middleware
  // Biarkan admin bisa akses /admin, nanti dicek di halaman admin saja
  // if (user && path.startsWith("/admin")) {
  //   const { data: profile } = await supabase
  //     .from("profiles")
  //     .select("role")
  //     .eq("id", user.id)
  //     .single();
  //   if (profile?.role !== "admin") {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/admin/:path*",
    "/admin",
    "/auth",
  ],
};
