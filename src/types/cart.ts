export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: number;
}

export interface Cart {
  items: CartItem[];
  lastModified: number;
}
