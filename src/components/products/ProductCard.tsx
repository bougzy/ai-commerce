"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { clsx } from "clsx";
import type { Product } from "@/types/product";
import type { ProductRecommendation } from "@/types/ai";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";
import { useSessionStore } from "@/stores/session-store";
import Badge from "@/components/ui/Badge";
import AiRecommendationBadge from "@/components/ai/AiRecommendationBadge";

interface ProductCardProps {
  product: Product;
  recommendation?: ProductRecommendation;
}

export default function ProductCard({ product, recommendation }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const trackEvent = useSessionStore((s) => s.trackEvent);

  const handleView = () => {
    trackEvent({
      type: "view",
      productId: product.id,
      category: product.category,
      timestamp: Date.now(),
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      onClick={handleView}
      className="group relative block rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
    >
      {recommendation && (
        <div className="absolute top-3 left-3 z-10">
          <AiRecommendationBadge recommendation={recommendation} />
        </div>
      )}

      <div className="relative h-48 bg-white/5 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs text-gray-400">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={clsx(
              "p-2 rounded-lg transition-all duration-200 cursor-pointer",
              "bg-white/10 text-gray-300 hover:bg-purple-500 hover:text-white"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
