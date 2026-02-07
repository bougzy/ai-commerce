"use client";

import { useEffect, useState } from "react";
import type { ProductRecommendation, RecommendProductsResponse } from "@/types/ai";
import type { Product } from "@/types/product";
import { useSessionStore } from "@/stores/session-store";
import { useCartStore } from "@/stores/cart-store";
import { getProductById } from "@/lib/data/products";
import ProductCard from "./ProductCard";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

interface ProductRecommendationRowProps {
  context: "home" | "products" | "product-detail" | "cart";
  currentProductId?: string;
  limit?: number;
}

export default function ProductRecommendationRow({
  context,
  currentProductId,
  limit = 4,
}: ProductRecommendationRowProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const profile = useSessionStore((s) => s.profile);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/recommend-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionProfile: profile,
            context: {
              currentPage: context,
              currentProductId,
              cartProductIds: cartItems.map((i) => i.productId),
              limit,
            },
          }),
        });
        const data: RecommendProductsResponse = await res.json();
        setRecommendations(data.recommendations);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [context, currentProductId, limit, profile.interactionCount]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((rec) => {
        const product = getProductById(rec.productId);
        if (!product) return null;
        return (
          <ProductCard
            key={rec.productId}
            product={product}
            recommendation={rec}
          />
        );
      })}
    </div>
  );
}
