import type { CategoryId } from "./product";

export type PriceSensitivity = "budget" | "moderate" | "premium" | "indifferent";

export interface SessionProfile {
  sessionId: string;
  startedAt: number;

  viewedProductIds: string[];
  viewedCategories: Partial<Record<CategoryId, number>>;
  searchQueries: string[];
  cartHistory: string[];

  priceRange: {
    min: number;
    max: number;
    average: number;
    sensitivity: PriceSensitivity;
  };
  categoryAffinity: Partial<Record<CategoryId, number>>;
  tagAffinity: Record<string, number>;
  interactionCount: number;
  lastInteractionAt: number;
}

export interface UserBehaviorEvent {
  type: "view" | "add-to-cart" | "remove-from-cart" | "search" | "chat";
  productId?: string;
  category?: CategoryId;
  query?: string;
  timestamp: number;
}
