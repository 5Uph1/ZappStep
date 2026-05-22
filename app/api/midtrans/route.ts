import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/email/SendEmail";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    console.log("=== MIDTRANS API START ===");

    // ── Ambil user dari session ─────────────────────────────────────────────
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

    console.log("1. User:", user?.id ?? "NOT FOUND");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Ambil body dari request ─────────────────────────────────────────────
    const body = await request.json();
    const { items, totalPrice, shippingAddress } = body;

    console.log("2. Items received:", items.length);
    console.log("2a. First item:", {
      productId: items[0]?.product?.id,
      variantId: items[0]?.variant?.id,
      quantity: items[0]?.quantity,
    });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart kosong" }, { status: 400 });
    }

    // ── VALIDASI STOK SUDAH DILAKUKAN DI FRONTEND ───────────────────────────
    console.log("3. Skipping backend stock check (validated on frontend)");

    // ── Buat order di Supabase ──────────────────────────────────────────────
    console.log("4. Creating order...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "unpaid",
        total_price: totalPrice,
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Gagal membuat order", detail: orderError?.message },
        { status: 500 },
      );
    }

    // ── Insert order items ──────────────────────────────────────────────────
    console.log("5. Inserting order items...");
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variant.id,
      size: item.variant.size,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json(
        { error: "Gagal menyimpan order items", detail: itemsError.message },
        { status: 500 },
      );
    }

    // ── KIRIM EMAIL PENDING (opsional, untuk notifikasi order dibuat) ───────
    try {
      const customerName = user.user_metadata?.full_name || "Customer";

      await sendOrderConfirmationEmail({
        to: user.email!,
        customerName: customerName,
        orderId: order.id,
        items: orderItems.map((item: any) => ({
          product: { name: item.product?.name || "Product" },
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: totalPrice,
        shippingAddress: shippingAddress,
        status: "pending",
        orderDate: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      console.log(`Email pending terkirim ke ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send pending email:", emailError);
      // Email gagal tidak mempengaruhi proses checkout
    }

    // ── Generate Midtrans Snap Token ────────────────────────────────────────
    console.log("6. Generating Midtrans token...");
    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: totalPrice,
      },
      item_details: items.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      customer_details: {
        email: user.email ?? `user-${user.id}@quickshop.com`,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders?from=payment`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // ── Simpan token ke order ───────────────────────────────────────────────
    await supabase
      .from("orders")
      .update({
        payment_token: transaction.token,
        payment_url: transaction.redirect_url,
      })
      .eq("id", order.id);

    console.log("=== MIDTRANS API SUCCESS ===");

    return NextResponse.json({
      token: transaction.token,
      orderId: order.id,
    });
  } catch (error: unknown) {
    console.error("=== MIDTRANS CATCH ERROR ===");
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
