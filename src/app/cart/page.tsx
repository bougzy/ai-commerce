"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { getProductById } from "@/lib/data/products";
import CartItemComponent from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import AiCartAdvisorPanel from "@/components/ai/AiCartAdvisorPanel";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="text-gray-400">
          Start browsing products and our AI will help you find the best deals!
        </p>
        <Link href="/products">
          <Button variant="ai">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items + summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            {items.map((item) => {
              const product = getProductById(item.productId);
              if (!product) return null;
              return (
                <CartItemComponent
                  key={item.productId}
                  item={item}
                  product={product}
                />
              );
            })}
          </div>
          <CartSummary />
        </div>

        {/* AI Advisor */}
        <div className="lg:col-span-1">
          <AiCartAdvisorPanel />
        </div>
      </div>
    </div>
  );
}
