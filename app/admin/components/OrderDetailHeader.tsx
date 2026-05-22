import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

type OrderDetailHeaderProps = {
  orderId: string;
  createdAt: string;
  status: string;
  formatDate: (dateStr: string) => string;
};

export function OrderDetailHeader({
  orderId,
  createdAt,
  status,
  formatDate,
}: OrderDetailHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href="/admin/orders"
        className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 mb-4"
      >
        ← Kembali ke Orders
      </Link>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Order #{orderId.slice(0, 8)}
          </h1>
          <p className="text-slate-500 mt-1">
            Dibuat pada {formatDate(createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}
