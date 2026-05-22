import { Icon } from "@/components/ui/Icon";

type Metrics = {
  revenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  stockAlerts: number;
};

export function AdminMetricsCards({ metrics }: { metrics: Metrics }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Revenue */}
      <div className="p-8 bg-white rounded-xl shadow-[0_15px_40px_-15px_rgba(0,105,72,0.1)] border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Revenue
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-3xl font-bold text-slate-900">
            Rp {metrics.revenue.toLocaleString("id-ID")}
          </h3>
          <span
            className={`font-bold text-sm ${metrics.revenueChange >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {metrics.revenueChange >= 0 ? "+" : ""}
            {metrics.revenueChange}%
          </span>
        </div>
        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <Icon name="trending_up" className="w-5 h-5 text-emerald-600" />
          <span className="text-sm">Since last month</span>
        </div>
      </div>

      {/* Total Orders */}
      <div className="p-8 bg-white rounded-xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Total Orders
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-3xl font-bold text-slate-900">
            {metrics.totalOrders}
          </h3>
          <span
            className={`font-bold text-sm ${metrics.ordersChange >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {metrics.ordersChange >= 0 ? "+" : ""}
            {metrics.ordersChange}%
          </span>
        </div>
        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <Icon name="shopping_cart" className="w-5 h-5 text-emerald-600" />
          <span className="text-sm">Active transactions</span>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="p-8 bg-white rounded-xl shadow-[0_15px_40px_-15px_rgba(186,26,26,0.1)] border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Stock Alerts
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-3xl font-bold text-red-600">
            {metrics.stockAlerts} Items
          </h3>
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
            Critical
          </span>
        </div>
        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <Icon name="warning" className="w-5 h-5 text-red-500" />
          <span className="text-sm">Require immediate restock</span>
        </div>
      </div>
    </section>
  );
}
