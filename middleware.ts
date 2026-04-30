import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Buat response yang bisa kita mutasi cookienya
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return request.cookies.get(key)?.value;
        },
        set(key, value, options) {
          // Set di request agar middleware bisa baca session yang baru
          request.cookies.set({ name: key, value, ...options });
          // Buat ulang response dengan headers request yang sudah diupdate
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          // Set juga di response agar browser menyimpan cookie
          response.cookies.set({ name: key, value, ...options });
        },
        remove(key, options) {
          request.cookies.set({ name: key, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name: key, value: "", ...options });
        },
      },
    },
  );

  // WAJIB: getUser() akan refresh session token jika expired
  // dan memperbarui cookie secara otomatis lewat setter di atas
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/auth");
  const isDashboard = path.startsWith("/dashboard");

  // Belum login → redirect ke /auth
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Sudah login → redirect ke /dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Kembalikan response dengan cookie yang sudah disync
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
