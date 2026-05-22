import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key) => cookieStore.get(key)?.value,
          set: () => {},
          remove: () => {},
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId wajib diisi" },
        { status: 400 },
      );
    }

    // ── Ambil order + items milik user ──────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_price,
        status,
        order_items (
          quantity,
          price,
          product:products ( id, name )
        )
      `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id) // pastikan milik user yang login
      .eq("status", "unpaid") // hanya boleh repay kalau masih unpaid
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan atau tidak bisa dibayar ulang" },
        { status: 404 },
      );
    }

    // ── Generate token baru dari Midtrans ───────────────────────────────────
    // Midtrans menolak order_id yang sama, jadi kita suffix dengan timestamp
    const midtransOrderId = `${order.id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.total_price,
      },
      item_details: order.order_items.map(
        (item: {
          product: { id: any; name: any }[];
          price: number;
          quantity: number;
        }) => ({
          id: item.product?.[0]?.id ?? "unknown",
          name: item.product?.[0]?.name ?? "Produk",
          price: item.price,
          quantity: item.quantity,
        }),
      ),
      customer_details: {
        email: user.email ?? `user-${user.id}@quickshop.com`,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders?from=payment`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // ── Simpan token baru ke order ──────────────────────────────────────────
    await supabase
      .from("orders")
      .update({
        payment_token: transaction.token,
        payment_url: transaction.redirect_url,
      })
      .eq("id", order.id);

    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error("Repay error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
