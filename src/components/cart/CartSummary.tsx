"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { getProductById } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils/format";
import Button from "@/components/ui/Button";

interface CartSummaryProps {
  potentialSaving?: number;
}

export default function CartSummary({ potentialSaving }: CartSummaryProps) {
  const items = useCartStore((s) => s.items);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
      <h3 className="text-lg font-bold text-white">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Items ({itemCount})</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Shipping</span>
          <span className="text-emerald-400">Free</span>
        </div>
        {potentialSaving != null && potentialSaving > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Potential savings</span>
            <span>-{formatPrice(potentialSaving)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between text-white font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link href="/checkout">
        <Button variant="ai" size="lg" className="w-full">
          Proceed to Checkout
        </Button>
      </Link>
      <p className="text-xs text-gray-500 text-center">
        Checkout is simulated — no real payment
      </p>
    </div>
  );
}
