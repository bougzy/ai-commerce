"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { getAllProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import type { CategoryId } from "@/types/product";
import type { ProductRecommendation, RecommendProductsResponse } from "@/types/ai";
import { useSessionStore } from "@/stores/session-store";
import { useCartStore } from "@/stores/cart-store";
import ProductGrid from "@/components/products/ProductGrid";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as CategoryId | null;
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">(
    categoryParam ?? "all"
  );
  const [recommendations, setRecommendations] = useState<
    Map<string, ProductRecommendation>
  >(new Map());

  const profile = useSessionStore((s) => s.profile);
  const cartItems = useCartStore((s) => s.items);

  const allProducts = useMemo(() => getAllProducts(), []);

  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  useEffect(() => {
    if (profile.interactionCount < 3) return;

    const fetchRecs = async () => {
      try {
        const res = await fetch("/api/ai/recommend-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionProfile: profile,
            context: {
              currentPage: "products",
              cartProductIds: cartItems.map((i) => i.productId),
              limit: 10,
            },
          }),
        });
        const data: RecommendProductsResponse = await res.json();
        const recMap = new Map<string, ProductRecommendation>();
        for (const rec of data.recommendations) {
          recMap.set(rec.productId, rec);
        }
        setRecommendations(recMap);
      } catch {
        // ignore
      }
    };

    fetchRecs();
  }, [profile.interactionCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <p className="text-gray-400 mt-1">
          {filteredProducts.length} products
          {activeCategory !== "all" &&
            ` in ${categories.find((c) => c.id === activeCategory)?.name}`}
          {profile.interactionCount >= 3 && " — AI badges active"}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === "all"
              ? "bg-purple-500 text-white"
              : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? "bg-purple-500 text-white"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <ProductGrid
        products={filteredProducts}
        recommendations={recommendations}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
