import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

type Product = {
  id: string;
  name: string;
  stock: string;
  stockClass: string;
  image_url: string | null;
};

export function InventoryList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6 text-center">
        <p className="text-slate-500 text-sm">
          Semua produk memiliki stok yang cukup
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                width={64}
                height={64}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                <Icon name="shopping_bag" className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
            <p className={item.stockClass}>{item.stock}</p>
          </div>
          <Link href={`/admin/products/${item.id}/edit`}>
            <button className="p-2 rounded-full hover:bg-emerald-50 text-emerald-700 transition-colors">
              <Icon name="edit" className="w-5 h-5" />
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
