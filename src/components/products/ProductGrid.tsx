"use client";

import type { Product } from "@/types/product";
import type { ProductRecommendation } from "@/types/ai";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  recommendations?: Map<string, ProductRecommendation>;
}

export default function ProductGrid({ products, recommendations }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          recommendation={recommendations?.get(product.id)}
        />
      ))}
    </div>
  );
}
