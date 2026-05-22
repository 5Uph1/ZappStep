interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  status: string;
  orderDate: string;
}

export function getOrderConfirmationHtml({
  orderId,
  customerName,
  customerEmail,
  items,
  totalPrice,
  shippingAddress,
  status,
  orderDate,
}: OrderConfirmationProps): string {
  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 0;">
        <strong>${item.name}</strong><br/>
        <span style="color: #64748b; font-size: 12px;">Ukuran: ${item.size}</span>
      </td>
      <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right;">Rp ${item.price.toLocaleString("id-ID")}</td>
      <td style="padding: 12px 0; text-align: right;">Rp ${(item.price * item.quantity).toLocaleString("id-ID")}</td>
    </tr>
  `,
    )
    .join("");

  const statusColor = status === "paid" ? "#10b981" : "#f59e0b";
  const statusText = status === "paid" ? "Dibayar" : "Menunggu Pembayaran";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ZeepStep</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5fbf5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #006948 0%, #00855d 100%); padding: 30px 20px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-style: italic;">ZeepStep</h1>
      <p style="color: #85f8c4; margin: 8px 0 0;">Konfirmasi Pesanan</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: ${statusColor}10; padding: 8px 16px; border-radius: 30px;">
          <span style="color: ${statusColor}; font-weight: 600;">✓ Status: ${statusText}</span>
        </div>
      </div>

      <p style="color: #334155; margin-bottom: 24px;">Halo <strong>${customerName}</strong>,</p>
      <p style="color: #334155; margin-bottom: 24px;">Terima kasih telah berbelanja di ZeepStep! Pesanan Anda telah berhasil dibuat dan sedang diproses.</p>

      <!-- Order Info -->
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Order ID</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">#${orderId.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Tanggal Order</td>
            <td style="padding: 4px 0; text-align: right;">${orderDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Email</td>
            <td style="padding: 4px 0; text-align: right;">${customerEmail}</td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px 0; text-align: left; font-size: 12px; color: #64748b;">Produk</th>
            <th style="padding: 12px 0; text-align: center; font-size: 12px; color: #64748b;">Qty</th>
            <th style="padding: 12px 0; text-align: right; font-size: 12px; color: #64748b;">Harga</th>
            <th style="padding: 12px 0; text-align: right; font-size: 12px; color: #64748b;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="border-top: 2px solid #e2e8f0;">
            <td colspan="3" style="padding: 16px 0 0; text-align: right; font-weight: 600;">Total</td>
            <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #006948;">Rp ${totalPrice.toLocaleString("id-ID")}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Shipping Address -->
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #334155;">📍 Alamat Pengiriman</p>
        <p style="margin: 0; color: #64748b;">${shippingAddress}</p>
      </div>

      <!-- Actions -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders" style="display: inline-block; background: #006948; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 600;">
          Lihat Pesanan Saya
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        © 2024 ZeepStep. All rights reserved.<br/>
        Jika ada pertanyaan, hubungi kami di support@zeepstep.com
      </p>
    </div>
  </div>
</body>
</html>`;
}
