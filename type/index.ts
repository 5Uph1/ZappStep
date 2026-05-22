export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
};

export type CartItem = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  size: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_url: string | null;
  };
};

export type Order = {
  id: string;
  user_id: string;
  status:
    | "unpaid"
    | "paid"
    | "processing"
    | "packed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "cancelling";
  total_price: number;
  shipping_address: string | null;
  tracking_number: string | null;
  payment_token: string | null;
  payment_url: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  // Cancel request fields
  cancel_requested: boolean;
  cancel_requested_at: string | null;
  cancel_reason: string | null;
  // Relations
  order_items?: OrderItem[];
  profiles?: {
    email: string;
  } | null;
};

// Untuk backward compatibility dengan kode lama
export type OrderItemWithVariant = OrderItem;
