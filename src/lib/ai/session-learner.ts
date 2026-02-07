import { v4 as uuidv4 } from "uuid";
import type { CategoryId } from "@/types/product";
import type { SessionProfile } from "@/types/session";

export function createDefaultProfile(): SessionProfile {
  return {
    sessionId: uuidv4(),
    startedAt: Date.now(),
    viewedProductIds: [],
    viewedCategories: {},
    searchQueries: [],
    cartHistory: [],
    priceRange: { min: 0, max: 0, average: 0, sensitivity: "indifferent" },
    categoryAffinity: {},
    tagAffinity: {},
    interactionCount: 0,
    lastInteractionAt: Date.now(),
  };
}

export function recalculateCategoryAffinity(
  profile: SessionProfile
): void {
  const totalViews = Object.values(profile.viewedCategories).reduce(
    (a, b) => a + (b ?? 0),
    0
  );
  if (totalViews === 0) return;

  for (const [cat, count] of Object.entries(profile.viewedCategories)) {
    profile.categoryAffinity[cat as CategoryId] = (count ?? 0) / totalViews;
  }
}

export function updateTagAffinity(
  profile: SessionProfile,
  tags: string[],
  delta: number
): void {
  for (const tag of tags) {
    const current = profile.tagAffinity[tag] ?? 0;
    profile.tagAffinity[tag] = Math.max(0, Math.min(1, current + delta));
  }
}

export function updatePriceRange(
  profile: SessionProfile,
  price: number
): void {
  const viewCount = profile.viewedProductIds.length;

  if (viewCount <= 1) {
    profile.priceRange = {
      min: price,
      max: price,
      average: price,
      sensitivity: "indifferent",
    };
    return;
  }

  profile.priceRange.min = Math.min(profile.priceRange.min, price);
  profile.priceRange.max = Math.max(profile.priceRange.max, price);
  profile.priceRange.average +=
    (price - profile.priceRange.average) / viewCount;

  const avg = profile.priceRange.average;
  const range = profile.priceRange.max - profile.priceRange.min;

  if (avg < 3000) {
    profile.priceRange.sensitivity = "budget";
  } else if (avg < 8000) {
    profile.priceRange.sensitivity = "moderate";
  } else if (avg >= 15000) {
    profile.priceRange.sensitivity = "premium";
  } else if (range > avg * 0.8) {
    profile.priceRange.sensitivity = "indifferent";
  } else {
    profile.priceRange.sensitivity = "moderate";
  }
}
