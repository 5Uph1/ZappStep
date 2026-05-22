import Link from "next/link";
import { STATUS_CONFIG } from "./StatusBadge";

type Order = {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
  tracking_number: string | null;
  profiles: { email: string } | null;
};

type OrdersTableProps = {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  formatDate: (dateStr: string) => string;
  formatPrice: (price: number) => string;
};

export function OrdersTable({
  orders,
  onUpdateStatus,
  formatDate,
  formatPrice,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
        <p className="text-slate-500">Tidak ada order yang ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Order ID
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Customer
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Total
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Tracking
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const config =
                STATUS_CONFIG[order.status] || STATUS_CONFIG.unpaid;
              // Debug: cek apakah email ada
              const customerEmail = order.profiles?.email || "N/A";
              return (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {customerEmail}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatPrice(order.total_price)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer ${config.bg} ${config.color}`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                        <option
                          key={status}
                          value={status}
                          className="text-slate-700 bg-white"
                        >
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {order.tracking_number || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors inline-block"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
