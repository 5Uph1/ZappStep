import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
};

type OrderItemsListProps = {
  items: OrderItem[];
  formatPrice: (price: number) => string;
};

export function OrderItemsList({ items, formatPrice }: OrderItemsListProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900">Item Pesanan</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
              {item.products?.image_url ? (
                <img
                  src={item.products.image_url}
                  alt={item.products.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <Icon
                    name="shopping_bag"
                    className="w-6 h-6 text-slate-400"
                  />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                {item.products?.name || "Unknown Product"}
              </h3>
              <p className="text-sm text-slate-500">
                {item.quantity} x {formatPrice(item.price)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-xl font-bold text-emerald-700">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
