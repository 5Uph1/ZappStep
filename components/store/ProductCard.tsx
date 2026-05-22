"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Product } from "@/type/index";
import { formatPrice } from "@/lib/dashboard/formatPrice";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/dashboard/product/${product.id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover p-4 group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="shopping_bag" className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] md:text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-sm md:text-base font-extrabold text-slate-900 mt-1">
            {formatPrice(product.price)}
          </p>

          {/* Size */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] text-slate-400">Ukuran:</span>
              <div className="flex flex-wrap gap-1">
                {product.variants.slice(0, 3).map((v) => (
                  <span
                    key={v.id}
                    className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                  >
                    {v.size}
                  </span>
                ))}
                {product.variants.length > 3 && (
                  <span className="text-[10px] text-slate-400">
                    +{product.variants.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
