export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: number;
}

export interface Cart {
  items: CartItem[];
  lastModified: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  createdAt: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}
