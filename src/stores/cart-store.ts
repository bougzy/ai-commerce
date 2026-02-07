"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { getProductById } from "@/lib/data/products";
import { useSessionStore } from "./session-store";

interface CartStore {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { productId, quantity: 1, addedAt: Date.now() },
            ],
          };
        });

        useSessionStore.getState().trackEvent({
          type: "add-to-cart",
          productId,
          timestamp: Date.now(),
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));

        useSessionStore.getState().trackEvent({
          type: "remove-from-cart",
          productId,
          timestamp: Date.now(),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const product = getProductById(item.productId);
          return sum + (product?.price ?? 0) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "ai-commerce-cart",
    }
  )
);
