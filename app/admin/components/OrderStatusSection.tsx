import { STATUS_CONFIG } from "./StatusBadge";

type OrderStatusSectionProps = {
  currentStatus: string;
  availableNextStatuses: string[];
  onUpdateStatus: (newStatus: string) => void;
  updating: boolean;
};

export function OrderStatusSection({
  currentStatus,
  availableNextStatuses,
  onUpdateStatus,
  updating,
}: OrderStatusSectionProps) {
  if (currentStatus === "cancelled" || currentStatus === "delivered")
    return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Update Status</h2>
      <div className="flex flex-wrap gap-3">
        {availableNextStatuses.map((nextStatus) => {
          const config = STATUS_CONFIG[nextStatus];
          return (
            <button
              key={nextStatus}
              onClick={() => onUpdateStatus(nextStatus)}
              disabled={updating}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${config.bg} ${config.color} hover:opacity-80 disabled:opacity-50`}
            >
              Mark as {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
