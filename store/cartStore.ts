import { create } from "zustand";
import { supabaseClient } from "@/lib/supabaseClient";
import { Product, ProductVariant, CartItem } from "@/type";

type CartStore = {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
  ) => Promise<void>;
  removeFromCart: (productId: string, variantId: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: true,

  fetchCart: async () => {
    set({ isLoading: true });

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      set({ items: [], isLoading: false });
      return;
    }

    const { data, error } = await supabaseClient
      .from("carts")
      .select("items")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching cart:", error);
      set({ items: [], isLoading: false });
      return;
    }

    set({ items: data?.items || [], isLoading: false });
  },

  addToCart: async (
    product: Product,
    variant: ProductVariant,
    quantity: number = 1,
  ) => {
    const { items } = get();

    const existingItemIndex = items.findIndex(
      (item) =>
        item.product.id === product.id && item.variant.id === variant.id,
    );

    let newItems;
    if (existingItemIndex !== -1) {
      newItems = [...items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity,
      };
    } else {
      newItems = [...items, { product, variant, quantity }];
    }

    set({ items: newItems });
    await syncCartToDatabase(newItems);
  },

  removeFromCart: async (productId: string, variantId: string) => {
    const newItems = get().items.filter(
      (item) =>
        !(item.product.id === productId && item.variant.id === variantId),
    );
    set({ items: newItems });
    await syncCartToDatabase(newItems);
  },

  updateQuantity: async (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      await get().removeFromCart(productId, variantId);
      return;
    }

    const newItems = get().items.map((item) =>
      item.product.id === productId && item.variant.id === variantId
        ? { ...item, quantity }
        : item,
    );
    set({ items: newItems });
    await syncCartToDatabase(newItems);
  },

  clearCart: async () => {
    set({ items: [] });
    await syncCartToDatabase([]);
  },

  totalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  },

  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));

// Fungsi helper untuk sync cart ke database
async function syncCartToDatabase(items: CartItem[]) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) return;

  // Cek apakah cart sudah ada untuk user ini
  const { data: existingCart } = await supabaseClient
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingCart) {
    // UPDATE jika sudah ada
    const { error } = await supabaseClient
      .from("carts")
      .update({
        items: items,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating cart:", error);
    }
  } else {
    // INSERT jika belum ada
    const { error } = await supabaseClient.from("carts").insert({
      user_id: user.id,
      items: items,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inserting cart:", error);
    }
  }
}
