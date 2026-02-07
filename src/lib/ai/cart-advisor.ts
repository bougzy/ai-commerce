import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import type { CartOptimization } from "@/types/ai";
import type { SessionProfile } from "@/types/session";
import { getProductById, getAllProducts } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils/format";

function detectBundles(
  cart: CartItem[],
  _allProducts: Product[]
): CartOptimization[] {
  const optimizations: CartOptimization[] = [];
  const cartProductIds = new Set(cart.map((item) => item.productId));

  for (const item of cart) {
    const product = getProductById(item.productId);
    if (!product) continue;

    for (const bundleId of product.bundleEligible) {
      if (!cartProductIds.has(bundleId)) {
        const bundleProduct = getProductById(bundleId);
        if (!bundleProduct) continue;

        optimizations.push({
          type: "bundle",
          title: `Complete the set with ${bundleProduct.name}`,
          description: `${product.name} pairs great with ${bundleProduct.name}. Customers who bought both saved an average of 15%.`,
          confidence: 0.75,
          affectedProductIds: [item.productId],
          suggestedProductId: bundleId,
          estimatedSaving: Math.round(bundleProduct.price * 0.15),
        });
      }
    }
  }

  // Deduplicate by suggestedProductId
  const seen = new Set<string>();
  return optimizations.filter((o) => {
    if (o.suggestedProductId && seen.has(o.suggestedProductId)) return false;
    if (o.suggestedProductId) seen.add(o.suggestedProductId);
    return true;
  });
}

function findAlternatives(
  cart: CartItem[],
  allProducts: Product[],
  profile: SessionProfile
): CartOptimization[] {
  if (
    profile.priceRange.sensitivity !== "budget" &&
    profile.priceRange.sensitivity !== "moderate"
  ) {
    return [];
  }

  const optimizations: CartOptimization[] = [];

  for (const item of cart) {
    const product = getProductById(item.productId);
    if (!product) continue;

    const alternatives = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          p.category === product.category &&
          p.price < product.price * 0.85 &&
          p.rating >= 3.5 &&
          p.tags.some((t) => product.tags.includes(t))
      )
      .sort((a, b) => b.rating - a.rating);

    if (alternatives.length > 0) {
      const alt = alternatives[0];
      const saving = product.price - alt.price;
      optimizations.push({
        type: "alternative",
        title: `Save ${formatPrice(saving)} with a similar option`,
        description: `${alt.name} (${alt.rating}/5 stars) offers similar features to ${product.name} at a lower price.`,
        confidence: 0.65,
        affectedProductIds: [item.productId],
        suggestedProductId: alt.id,
        estimatedSaving: saving,
      });
    }
  }

  return optimizations;
}

function detectOverlaps(cart: CartItem[]): CartOptimization[] {
  const optimizations: CartOptimization[] = [];
  const cartProducts = cart
    .map((item) => ({
      ...item,
      product: getProductById(item.productId),
    }))
    .filter((cp) => cp.product != null) as Array<
    CartItem & { product: Product }
  >;

  const subcategoryGroups: Record<string, typeof cartProducts> = {};
  for (const cp of cartProducts) {
    const key = `${cp.product.category}:${cp.product.subcategory}`;
    (subcategoryGroups[key] ??= []).push(cp);
  }

  for (const group of Object.values(subcategoryGroups)) {
    if (group.length >= 2) {
      optimizations.push({
        type: "remove-duplicate",
        title: "Similar items detected",
        description: `You have ${group.length} items in ${group[0].product.subcategory}. Did you mean to add both ${group.map((g) => g.product.name).join(" and ")}?`,
        confidence: 0.55,
        affectedProductIds: group.map((g) => g.productId),
      });
    }
  }

  return optimizations;
}

function analyzePriceSensitivity(
  cart: CartItem[],
  profile: SessionProfile
): CartOptimization | null {
  const cartTotal = cart.reduce((sum, item) => {
    const p = getProductById(item.productId);
    return sum + (p?.price ?? 0) * item.quantity;
  }, 0);

  const avgBrowsedPrice = profile.priceRange.average;
  if (avgBrowsedPrice === 0) return null;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const avgCartPrice = cartTotal / Math.max(1, itemCount);

  if (
    avgCartPrice > avgBrowsedPrice * 1.5 &&
    profile.priceRange.sensitivity !== "premium"
  ) {
    return {
      type: "price-alert",
      title: "Cart is above your typical range",
      description: `Your cart averages ${formatPrice(avgCartPrice)} per item, while you've been browsing items around ${formatPrice(avgBrowsedPrice)}. Want me to find some alternatives?`,
      confidence: 0.7,
      affectedProductIds: cart.map((i) => i.productId),
    };
  }

  return null;
}

function suggestQuantityDiscounts(cart: CartItem[]): CartOptimization[] {
  return cart
    .filter((item) => item.quantity >= 2 && item.quantity < 5)
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      return {
        type: "quantity-discount" as const,
        title: `Get more value on ${product.name}`,
        description: `You already have ${item.quantity}. Buying ${item.quantity + 1} or more often qualifies for multi-buy savings.`,
        confidence: 0.5,
        affectedProductIds: [item.productId],
        estimatedSaving: Math.round(product.price * 0.1),
      };
    })
    .filter(Boolean) as CartOptimization[];
}

export function analyzeCart(
  cart: CartItem[],
  profile: SessionProfile
): CartOptimization[] {
  if (cart.length === 0) return [];

  const allProducts = getAllProducts();

  const bundles = detectBundles(cart, allProducts);
  const alternatives = findAlternatives(cart, allProducts, profile);
  const overlaps = detectOverlaps(cart);
  const priceAlert = analyzePriceSensitivity(cart, profile);
  const quantityDeals = suggestQuantityDiscounts(cart);

  const all = [
    ...bundles,
    ...alternatives,
    ...overlaps,
    ...(priceAlert ? [priceAlert] : []),
    ...quantityDeals,
  ];

  return all.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}
