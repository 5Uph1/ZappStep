import { Product } from "@/type/index";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function ProductGrid({
  products,
  loading,
  error,
  onRetry,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-200 rounded-xl aspect-square mb-3" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-emerald-700 text-white rounded-full text-sm font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Belum ada produk tersedia.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
