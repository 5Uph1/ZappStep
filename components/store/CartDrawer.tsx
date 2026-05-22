"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/dashboard/formatPrice";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCartStore();

  const handleCheckout = () => {
    onClose();
    router.push("/dashboard/checkout");
  };

  return (
    <>
      {/* ── Overlay ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Drawer — bottom sheet di mobile, side drawer di desktop ─────── */}
      <div
        className={`
          fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out
          flex flex-col

          /* Mobile: muncul dari bawah, full width */
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[85dvh]
          ${open ? "translate-y-0" : "translate-y-full"}

          /* Desktop: muncul dari kanan, fixed width */
          md:bottom-0 md:top-0 md:left-auto md:right-0 md:rounded-none
          md:w-[400px] md:max-h-full
          ${open ? "md:translate-x-0" : "md:translate-x-full"}
          md:translate-y-0
        `}
      >
        {/* ── Handle bar (mobile only) ────────────────────────────────────── */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="shopping_cart" className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Keranjang</h2>
            {items.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((sum, i) => sum + i.quantity, 0)} item
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Empty state */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-4 text-center px-5">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon
                  name="shopping_cart"
                  className="w-10 h-10 text-slate-300"
                />
              </div>
              <div>
                <p className="font-bold text-slate-700">Keranjang kosong</p>
                <p className="text-slate-400 text-sm mt-1">
                  Tambahkan produk untuk mulai belanja
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 px-5">
              {items.map(({ product, variant, quantity }) => {
                // Guard clause: jika variant tidak ada, skip atau tampilkan default
                const variantStock = variant?.stock || 0;
                const variantSize = variant?.size || "-";
                const maxReached = quantity >= variantStock;

                return (
                  <li
                    key={`${product.id}-${variant?.id || "no-variant"}`}
                    className="py-4 flex gap-4"
                  >
                    {/* Gambar produk */}
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            name="shopping_bag"
                            className="w-8 h-8 text-slate-300"
                          />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className="text-sm font-bold text-slate-900 truncate"
                            title={product.name}
                          >
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ukuran: {variantSize}
                          </p>
                        </div>
                        {/* Hapus button */}
                        <button
                          onClick={() =>
                            removeFromCart(product.id, variant?.id || "")
                          }
                          className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Icon name="delete" className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-emerald-700 text-sm font-bold mt-1">
                        {formatPrice(product.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              variant?.id || "",
                              quantity - 1,
                            )
                          }
                          className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-slate-900 w-6 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              variant?.id || "",
                              quantity + 1,
                            )
                          }
                          disabled={maxReached}
                          className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {maxReached && (
                        <p className="text-xs text-amber-600 mt-1">
                          Stok maksimal {variantStock} unit
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer — hanya tampil kalau ada item ────────────────────────── */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3 flex-shrink-0">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="text-base font-bold text-slate-900">
                {formatPrice(totalPrice())}
              </span>
            </div>

            {/* Tombol checkout */}
            <button
              onClick={handleCheckout}
              className="w-full h-12 bg-emerald-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all"
            >
              Checkout
            </button>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
            >
              Kosongkan keranjang
            </button>
          </div>
        )}
      </div>
    </>
  );
}
