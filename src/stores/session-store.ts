"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionProfile, UserBehaviorEvent } from "@/types/session";
import { getProductById } from "@/lib/data/products";
import {
  createDefaultProfile,
  recalculateCategoryAffinity,
  updateTagAffinity,
  updatePriceRange,
} from "@/lib/ai/session-learner";

interface SessionStore {
  profile: SessionProfile;
  trackEvent: (event: UserBehaviorEvent) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      profile: createDefaultProfile(),

      trackEvent: (event) => {
        set((state) => {
          const updated = JSON.parse(
            JSON.stringify(state.profile)
          ) as SessionProfile;
          updated.interactionCount++;
          updated.lastInteractionAt = event.timestamp;

          switch (event.type) {
            case "view": {
              if (!event.productId) break;
              const product = getProductById(event.productId);
              if (!product) break;

              if (!updated.viewedProductIds.includes(event.productId)) {
                updated.viewedProductIds.push(event.productId);
              }

              updated.viewedCategories[product.category] =
                (updated.viewedCategories[product.category] ?? 0) + 1;
              recalculateCategoryAffinity(updated);
              updateTagAffinity(updated, product.tags, 0.1);
              updatePriceRange(updated, product.price);
              break;
            }
            case "add-to-cart": {
              if (!event.productId) break;
              const product = getProductById(event.productId);
              if (!product) break;

              updateTagAffinity(updated, product.tags, 0.25);
              updated.viewedCategories[product.category] =
                (updated.viewedCategories[product.category] ?? 0) + 2;
              recalculateCategoryAffinity(updated);
              break;
            }
            case "remove-from-cart": {
              if (!event.productId) break;
              const product = getProductById(event.productId);
              if (!product) break;

              updated.cartHistory.push(event.productId);
              updateTagAffinity(updated, product.tags, -0.05);
              break;
            }
            case "search": {
              if (event.query) {
                updated.searchQueries.push(event.query);
              }
              break;
            }
          }

          return { profile: updated };
        });
      },

      resetSession: () => set({ profile: createDefaultProfile() }),
    }),
    {
      name: "ai-commerce-session",
    }
  )
);
