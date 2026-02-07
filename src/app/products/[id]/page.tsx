"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { useSessionStore } from "@/stores/session-store";
import ProductDetail from "@/components/products/ProductDetail";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);
  const trackEvent = useSessionStore((s) => s.trackEvent);

  useEffect(() => {
    if (product) {
      trackEvent({
        type: "view",
        productId: product.id,
        category: product.category,
        timestamp: Date.now(),
      });
    }
  }, [product?.id]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <ProductDetail product={product} />
    </div>
  );
}
