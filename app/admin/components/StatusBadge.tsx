export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; next?: string[] }
> = {
  unpaid: {
    label: "Unpaid",
    color: "text-amber-700",
    bg: "bg-amber-50",
    next: ["paid", "cancelled"],
  },
  paid: {
    label: "Paid",
    color: "text-blue-700",
    bg: "bg-blue-50",
    next: ["processing", "cancelled"],
  },
  processing: {
    label: "Processing",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    next: ["packed"],
  },
  packed: {
    label: "Packed",
    color: "text-purple-700",
    bg: "bg-purple-50",
    next: ["shipped"],
  },
  shipped: {
    label: "Shipped",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    next: ["delivered"],
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bg: "bg-green-100",
    next: [],
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    next: [],
  },
};

export const STATUS_OPTIONS = Object.keys(STATUS_CONFIG);

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
  return (
    <span
      className={`${config.bg} ${config.color} text-xs font-bold px-3 py-1 rounded-full`}
    >
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusClass(status: string): string {
  const config = STATUS_CONFIG[status];
  return config
    ? `${config.bg} ${config.color}`
    : "bg-slate-100 text-slate-600";
}

// Tambahan: fungsi untuk mendapatkan next statuses
export function getNextStatuses(status: string): string[] {
  return STATUS_CONFIG[status]?.next || [];
}
