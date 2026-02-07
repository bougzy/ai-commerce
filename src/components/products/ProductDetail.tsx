"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";
import Button from "@/components/ui/Button";
import ProductRecommendationRow from "./ProductRecommendationRow";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="relative aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
          {product.originalPrice && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-purple-400 font-medium mb-1 capitalize">
              {product.category} / {product.subcategory}
            </p>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {product.rating} ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-gray-300 leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          <Button
            variant={added ? "secondary" : "ai"}
            size="lg"
            onClick={handleAdd}
            className="w-full"
          >
            {added ? (
              <>
                <Check className="w-5 h-5" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6">
          You might also like
        </h2>
        <ProductRecommendationRow
          context="product-detail"
          currentProductId={product.id}
        />
      </div>
    </div>
  );
}
