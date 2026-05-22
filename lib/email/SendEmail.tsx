import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderId,
  items,
  totalPrice,
  shippingAddress,
  status,
  orderDate,
}: {
  to: string;
  customerName: string;
  orderId: string;
  items: any[];
  totalPrice: number;
  shippingAddress: string;
  status: string;
  orderDate: string;
}) {
  const { getOrderConfirmationHtml } =
    await import("./templates/OrderConfirmation");

  const html = getOrderConfirmationHtml({
    orderId,
    customerName,
    customerEmail: to,
    items: items.map((item) => ({
      name: item.product?.name || "Product",
      size: item.size || "-",
      quantity: item.quantity,
      price: item.price,
    })),
    totalPrice,
    shippingAddress,
    status,
    orderDate,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: "ZeepStep <noreply@resend.dev>", // Ganti dengan domain Anda nanti
      to: [to],
      subject: `✨ Order Confirmation #${orderId.slice(0, 8).toUpperCase()}`,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
