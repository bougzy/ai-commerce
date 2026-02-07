import type { Product } from "@/types/product";
import type { SessionProfile } from "@/types/session";
import type {
  RecommendationFactor,
  ProductRecommendation,
  CartOptimization,
} from "@/types/ai";
import { getCategoryName } from "@/lib/data/categories";
import { getProductById } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils/format";

interface ReasoningContext {
  product: Product;
  score: number;
  factors: RecommendationFactor[];
  profile: SessionProfile;
}

export function generateReasoning(ctx: ReasoningContext): string {
  const { product, factors, profile } = ctx;
  const topFactors = [...factors].sort((a, b) => b.weight - a.weight).slice(0, 2);
  const parts: string[] = [];

  for (const factor of topFactors) {
    switch (factor.name) {
      case "Category Affinity": {
        const viewCount = profile.viewedCategories[product.category] ?? 0;
        const catName = getCategoryName(product.category);
        if (viewCount > 3) {
          parts.push(
            `You've been exploring ${catName} products (${viewCount} items viewed this session), and this is a strong match in that category.`
          );
        } else if (viewCount > 0) {
          parts.push(
            `Based on your interest in ${catName}, this could be a great pick.`
          );
        }
        break;
      }
      case "Price Range Fit": {
        const avgPrice = formatPrice(profile.priceRange.average);
        parts.push(
          `At ${formatPrice(product.price)}, this fits well within your typical browsing range around ${avgPrice}.`
        );
        break;
      }
      case "Tag Affinity": {
        const matchingTags = product.tags.filter(
          (t) => (profile.tagAffinity[t] ?? 0) > 0.3
        );
        if (matchingTags.length > 0) {
          parts.push(
            `This matches your interest in ${matchingTags.slice(0, 2).join(" and ")} products.`
          );
        } else {
          parts.push(
            `The features of this product align with your browsing patterns.`
          );
        }
        break;
      }
      case "Popularity":
        parts.push(
          `This is one of our most popular items with a ${product.rating}/5 rating from ${product.reviewCount.toLocaleString()} reviews.`
        );
        break;
      case "Recency Boost":
        parts.push(
          `Based on what you were just browsing, this seems like a great next pick.`
        );
        break;
    }
  }

  return parts.join(" ") || "This product could be a great addition based on current trends.";
}

export function generateConversationalResponse(
  recommendations: ProductRecommendation[],
  query: string | undefined,
  profile: SessionProfile
): string {
  const count = recommendations.length;

  if (count === 0) {
    if (query) {
      return `I couldn't find products matching "${query}" right now. Try browsing our categories or asking me about something else!`;
    }
    return "I don't have enough data yet to make personalized recommendations. Try browsing some products first!";
  }

  const interaction = profile.interactionCount;

  if (query) {
    const topName = recommendations[0]
      ? (getProductById(recommendations[0].productId)?.name ?? "this one")
      : "these";
    return `Based on your request, I found ${count} great options. I'd especially recommend ${topName} — ${recommendations[0]?.reasoning.split(".")[0]}.`;
  }

  if (interaction < 3) {
    return `Here are ${count} popular picks to get you started! As you browse more, I'll learn your preferences and personalize these suggestions.`;
  }

  if (interaction < 8) {
    return `I'm starting to understand your taste! Here are ${count} products I think you'll like based on your browsing so far.`;
  }

  return `Based on everything I've learned about your preferences, here are my top ${count} picks for you. I'm quite confident about these recommendations!`;
}

export function generateSessionInsight(profile: SessionProfile): string {
  const interaction = profile.interactionCount;

  if (interaction < 2) {
    return "I'm just getting started learning your preferences. Browse a few products and I'll start personalizing!";
  }

  const topCategories = Object.entries(profile.categoryAffinity)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 2);

  const topTags = Object.entries(profile.tagAffinity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  const parts: string[] = [];

  if (topCategories.length > 0) {
    const catNames = topCategories.map(([id]) => getCategoryName(id as never));
    parts.push(`You seem to enjoy ${catNames.join(" and ")}`);
  }

  if (topTags.length > 0) {
    parts.push(`with a preference for ${topTags.join(", ")} features`);
  }

  if (profile.priceRange.average > 0) {
    parts.push(`in the ${formatPrice(profile.priceRange.average)} range`);
  }

  return parts.join(" ") + ".";
}

export function generateCartSummary(optimizations: CartOptimization[]): string {
  if (optimizations.length === 0) {
    return "Your cart looks good! I don't have any optimization suggestions right now.";
  }

  const totalSaving = optimizations.reduce(
    (sum, o) => sum + (o.estimatedSaving ?? 0),
    0
  );

  if (totalSaving > 0) {
    return `I found ${optimizations.length} suggestion${optimizations.length > 1 ? "s" : ""} that could save you up to ${formatPrice(totalSaving)}!`;
  }

  return `I have ${optimizations.length} suggestion${optimizations.length > 1 ? "s" : ""} to optimize your cart.`;
}

export function generatePriceSensitivityInsight(
  profile: SessionProfile
): string {
  switch (profile.priceRange.sensitivity) {
    case "budget":
      return "You appear to be a value-conscious shopper — I'll prioritize affordable options.";
    case "moderate":
      return "You tend to browse mid-range products — a nice balance of quality and value.";
    case "premium":
      return "You gravitate toward premium products — I'll highlight top-tier options.";
    case "indifferent":
      return "You browse across a wide price range — I'll show you the best options regardless of price.";
  }
}
