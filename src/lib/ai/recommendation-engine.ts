import type { Product, CategoryId } from "@/types/product";
import type { SessionProfile } from "@/types/session";
import type { BadgeType, RecommendationFactor } from "@/types/ai";
import { getCategoryById } from "@/lib/data/categories";
import { getAllProducts, getProductById } from "@/lib/data/products";
import { SCORING_WEIGHTS } from "@/lib/utils/constants";

interface ScoredProduct {
  product: Product;
  score: number;
  factors: RecommendationFactor[];
}

function calculateCategoryAffinity(
  product: Product,
  profile: SessionProfile
): number {
  const directAffinity = profile.categoryAffinity[product.category] ?? 0;
  const category = getCategoryById(product.category);
  const relatedAffinity = category.relatedCategories.reduce((sum, relCatId) => {
    return sum + (profile.categoryAffinity[relCatId] ?? 0) * 0.4;
  }, 0);
  return Math.min(100, (directAffinity + relatedAffinity) * 100);
}

function calculatePriceRangeFit(
  product: Product,
  profile: SessionProfile
): number {
  const { average, min, max } = profile.priceRange;
  if (average === 0) return 50;

  const price = product.price;
  const range = max - min || 1;
  const distance = Math.abs(price - average);
  const normalizedDistance = distance / range;
  return Math.max(
    0,
    100 * Math.exp(-2 * normalizedDistance * normalizedDistance)
  );
}

function calculateTagAffinity(
  product: Product,
  profile: SessionProfile
): number {
  if (product.tags.length === 0) return 0;
  const totalAffinity = product.tags.reduce((sum, tag) => {
    return sum + (profile.tagAffinity[tag] ?? 0);
  }, 0);
  return Math.min(100, (totalAffinity / product.tags.length) * 100);
}

function calculatePopularity(product: Product): number {
  return product.popularityScore * 0.8 + product.rating * 4;
}

function calculateRecencyBoost(
  product: Product,
  profile: SessionProfile
): number {
  const recentViews = profile.viewedProductIds.slice(-3);
  const recentProducts = recentViews
    .map((id) => getProductById(id))
    .filter(Boolean) as Product[];
  const recentCategories = new Set(recentProducts.map((p) => p.category));
  const recentTags = new Set(recentProducts.flatMap((p) => p.tags));

  let boost = 0;
  if (recentCategories.has(product.category)) boost += 60;
  const tagOverlap = product.tags.filter((t) => recentTags.has(t)).length;
  boost += Math.min(40, tagOverlap * 15);
  return Math.min(100, boost);
}

export function determineBadgeType(
  product: Product,
  score: number,
  factors: RecommendationFactor[]
): { badgeText: string; badgeType: BadgeType } {
  if (score >= 85) return { badgeText: "Best for You", badgeType: "best-match" };

  const sorted = [...factors].sort((a, b) => b.weight - a.weight);
  const topFactor = sorted[0];
  if (!topFactor) return { badgeText: "New for You", badgeType: "new-for-you" };

  if (topFactor.name === "Price Range Fit" && product.originalPrice)
    return { badgeText: "Great Value", badgeType: "value" };
  if (topFactor.name === "Popularity")
    return { badgeText: "Trending", badgeType: "trending" };
  if (topFactor.name === "Tag Affinity")
    return { badgeText: "Similar to Viewed", badgeType: "complement" };
  if (topFactor.name === "Category Affinity")
    return { badgeText: "Best for You", badgeType: "best-match" };
  return { badgeText: "New for You", badgeType: "new-for-you" };
}

export function scoreAllProducts(
  profile: SessionProfile,
  context: {
    currentPage: string;
    currentProductId?: string;
    cartProductIds?: string[];
  }
): ScoredProduct[] {
  const allProducts = getAllProducts();
  const cartIds = new Set(context.cartProductIds ?? []);

  return allProducts
    .filter((p) => p.inStock)
    .map((product) => {
      const catScore = calculateCategoryAffinity(product, profile);
      const priceScore = calculatePriceRangeFit(product, profile);
      const tagScore = calculateTagAffinity(product, profile);
      const popScore = calculatePopularity(product);
      const recencyScore = calculateRecencyBoost(product, profile);

      const factors: RecommendationFactor[] = [
        {
          name: "Category Affinity",
          weight: (catScore / 100) * SCORING_WEIGHTS.categoryAffinity,
          detail: `${getCategoryById(product.category).name} affinity: ${Math.round(catScore)}%`,
        },
        {
          name: "Price Range Fit",
          weight: (priceScore / 100) * SCORING_WEIGHTS.priceRangeFit,
          detail: `Price fit: ${Math.round(priceScore)}%`,
        },
        {
          name: "Tag Affinity",
          weight: (tagScore / 100) * SCORING_WEIGHTS.tagAffinity,
          detail: `Tag match: ${Math.round(tagScore)}%`,
        },
        {
          name: "Popularity",
          weight: (popScore / 100) * SCORING_WEIGHTS.popularity,
          detail: `Popularity: ${Math.round(popScore)}%`,
        },
        {
          name: "Recency Boost",
          weight: (recencyScore / 100) * SCORING_WEIGHTS.recencyBoost,
          detail: `Recency: ${Math.round(recencyScore)}%`,
        },
      ];

      let score =
        catScore * SCORING_WEIGHTS.categoryAffinity +
        priceScore * SCORING_WEIGHTS.priceRangeFit +
        tagScore * SCORING_WEIGHTS.tagAffinity +
        popScore * SCORING_WEIGHTS.popularity +
        recencyScore * SCORING_WEIGHTS.recencyBoost;

      // Penalties
      if (cartIds.has(product.id)) score -= 30;
      if (context.currentProductId === product.id) score -= 50;
      const lastViewed = profile.viewedProductIds.slice(-1)[0];
      if (lastViewed === product.id) score -= 20;

      return { product, score: Math.max(0, score), factors };
    });
}

export function applyQueryFilter(
  scored: ScoredProduct[],
  query: string
): ScoredProduct[] {
  const lower = query.toLowerCase();
  const terms = lower.split(/\s+/).filter((t) => t.length > 2);

  return scored.filter((sp) => {
    const searchable = [
      sp.product.name,
      sp.product.description,
      sp.product.category,
      sp.product.subcategory,
      ...sp.product.tags,
    ]
      .join(" ")
      .toLowerCase();

    return terms.some((term) => searchable.includes(term));
  });
}
