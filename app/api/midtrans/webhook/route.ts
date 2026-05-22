import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ── Inisialisasi Resend ──────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Pakai CoreApi untuk verifikasi webhook ────────────────────────────────────
const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// ── Pakai service role — bypass RLS, tidak butuh cookies ─────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// EMAIL TOKO (GMAIL ANDA)
const STORE_EMAIL = "alifsufim@gmail.com";

// ── Fungsi untuk generate HTML email untuk pemilik toko ────────────────────────
function getAdminOrderNotificationHtml(order: any) {
  const itemsHtml = order.order_items
    .map(
      (item: any) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 0;">
        <strong>${item.product?.name || "Product"}</strong><br/>
        <span style="color: #64748b; font-size: 12px;">Ukuran: ${item.size || "-"}</span>
      </td>
      <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right;">Rp ${item.price.toLocaleString("id-ID")}</td>
      <td style="padding: 12px 0; text-align: right;">Rp ${(item.price * item.quantity).toLocaleString("id-ID")}</td>
    </tr>
  `,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order - ZeepStep</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5fbf5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: #006948; padding: 30px 20px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="color: white; margin: 0;">ZeepStep</h1>
      <p style="color: #85f8c4; margin: 8px 0 0;">Notifikasi Order Baru! 🎉</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <p style="color: #334155;">Halo Admin,</p>
      <p style="color: #334155;">Ada order baru yang telah dibayar. Berikut detailnya:</p>

      <!-- Order Info -->
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Order ID</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Tanggal</td>
            <td style="padding: 4px 0; text-align: right;">${new Date(
              order.created_at,
            ).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Total</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #006948;">Rp ${order.total_price.toLocaleString("id-ID")}</td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <h3 style="margin: 0 0 16px; font-size: 16px;">Detail Pesanan:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px 0; text-align: left;">Produk</th>
            <th style="padding: 12px 0; text-align: center;">Qty</th>
            <th style="padding: 12px 0; text-align: right;">Harga</th>
            <th style="padding: 12px 0; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="border-top: 2px solid #e2e8f0;">
            <td colspan="3" style="padding: 16px 0 0; text-align: right; font-weight: 600;">Total</td>
            <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #006948;">Rp ${order.total_price.toLocaleString("id-ID")}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Alamat -->
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-weight: 600;">📍 Alamat Pengiriman</p>
        <p style="margin: 0; color: #64748b;">${order.shipping_address || "-"}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <!-- Action Button -->
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders/${order.id}" 
           style="display: inline-block; background: #006948; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 600;">
          Kelola Order di Admin Panel
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        Email ini dikirim otomatis dari ZeepStep.<br/>
        © 2024 ZeepStep
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Verifikasi notifikasi dari Midtrans ───────────────────────────────────
    // @ts-ignore
    const statusResponse = await coreApi.transaction.notification(body);

    const rawOrderId = statusResponse.order_id as string;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // ── Parse orderId ────────────────────────────────────────────────────────
    const segments = rawOrderId.split("-");
    const orderId =
      segments.length > 5 ? segments.slice(0, 5).join("-") : rawOrderId;

    console.log(
      `Webhook received — Order: ${orderId}, Status: ${transactionStatus}`,
    );

    // ── Tentukan status order ─────────────────────────────────────────────────
    let orderStatus: "unpaid" | "paid" | "failed" = "unpaid";

    if (transactionStatus === "capture") {
      orderStatus = fraudStatus === "accept" ? "paid" : "failed";
    } else if (transactionStatus === "settlement") {
      orderStatus = "paid";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderStatus = "failed";
    }

    // ── Update status order ───────────────────────────────────────────────────
    await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", orderId);

    console.log(`Order ${orderId} updated to ${orderStatus}`);

    // ── Kalau paid, kurangi stock dan kirim email ke GMAIL ANDA ─────────────────
    if (orderStatus === "paid") {
      // Update stock
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", orderId);

      if (orderItems) {
        for (const item of orderItems) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock")
            .eq("id", item.variant_id)
            .single();

          if (variant) {
            const newStock = Math.max(0, variant.stock - item.quantity);
            await supabase
              .from("product_variants")
              .update({ stock: newStock })
              .eq("id", item.variant_id);
          }
        }
      }

      // ── KIRIM EMAIL KE GMAIL ANDA (alifsufim@gmail.com) ─────────────────────
      const { data: orderDetail } = await supabase
        .from("orders")
        .select(
          `
          id,
          total_price,
          shipping_address,
          created_at,
          user_id,
          order_items (
            quantity,
            price,
            size,
            product:products (name)
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (orderDetail) {
        console.log(`📧 Sending email notification to: ${STORE_EMAIL}`);

        const emailHtml = getAdminOrderNotificationHtml(orderDetail);

        const { data, error } = await resend.emails.send({
          from: "ZeepStep <onboarding@resend.dev>",
          to: [STORE_EMAIL], // ← KIRIM KE GMAIL ANDA
          subject: `🛍️ New Order! #${orderId.slice(0, 8).toUpperCase()} - Total: Rp ${orderDetail.total_price.toLocaleString("id-ID")}`,
          html: emailHtml,
        });

        if (error) {
          console.error("❌ Error sending email:", error);
        } else {
          console.log("✅ Email sent to admin successfully:", data);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
