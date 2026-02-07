"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Order, OrderItem, ShippingAddress, CartItem } from "@/types/cart";
import { getProductById } from "@/lib/data/products";
import { useCartStore } from "./cart-store";

interface OrderStore {
  orders: Order[];
  placeOrder: (address: ShippingAddress) => string;
  deleteOrder: (orderId: string) => void;
  getOrder: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (address) => {
        const cartItems = useCartStore.getState().items;
        if (cartItems.length === 0) return "";

        const orderItems: OrderItem[] = cartItems
          .map((item: CartItem) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return {
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: product.price,
            };
          })
          .filter(Boolean) as OrderItem[];

        const total = orderItems.reduce(
          (sum, item) => sum + item.priceAtPurchase * item.quantity,
          0
        );

        const order: Order = {
          id: uuidv4(),
          items: orderItems,
          total,
          shippingAddress: address,
          status: "confirmed",
          createdAt: Date.now(),
        };

        set((state) => ({
          orders: [order, ...state.orders],
        }));

        useCartStore.getState().clearCart();

        return order.id;
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));
      },

      getOrder: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },
    }),
    {
      name: "ai-commerce-orders",
    }
  )
);
