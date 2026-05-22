import { STATUS_CONFIG, STATUS_OPTIONS } from "./StatusBadge";

type OrdersFilterProps = {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
};

export function OrdersFilter({
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  onRefresh,
}: OrdersFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filterStatus === "all"
              ? "bg-emerald-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterStatus === status
                  ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-emerald-400`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Cari order ID atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <svg
          className="absolute right-3 top-2.5 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="md:ml-auto">
        <button
          onClick={onRefresh}
          className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}
