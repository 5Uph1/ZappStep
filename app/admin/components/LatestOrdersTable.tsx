import Link from "next/link";

type Order = {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: string;
  statusClass: string;
};

export function LatestOrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="px-6 py-12 text-center text-slate-500">
          Belum ada order
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Order ID", "Customer", "Date", "Total", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-slate-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 text-slate-500">{order.customer}</td>
                <td className="px-6 py-4 text-slate-500">{order.date}</td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {order.total}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`${order.statusClass} text-xs font-bold px-3 py-1 rounded-full`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
