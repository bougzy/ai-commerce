"use client";

import { Package, ArrowRightLeft, Copy, AlertTriangle, Plus } from "lucide-react";
import type { CartOptimization } from "@/types/ai";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";
import AiConfidenceBar from "@/components/ai/AiConfidenceBar";

interface CartOptimizationCardProps {
  optimization: CartOptimization;
}

const iconMap = {
  bundle: Package,
  alternative: ArrowRightLeft,
  "remove-duplicate": Copy,
  "price-alert": AlertTriangle,
  "quantity-discount": Plus,
};

export default function CartOptimizationCard({
  optimization,
}: CartOptimizationCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const Icon = iconMap[optimization.type];

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">
            {optimization.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            {optimization.description}
          </p>
        </div>
      </div>

      {optimization.estimatedSaving != null && optimization.estimatedSaving > 0 && (
        <div className="text-xs text-emerald-400 font-medium">
          Potential saving: {formatPrice(optimization.estimatedSaving)}
        </div>
      )}

      <AiConfidenceBar confidence={optimization.confidence} />

      {optimization.suggestedProductId && optimization.type === "bundle" && (
        <button
          onClick={() => addItem(optimization.suggestedProductId!)}
          className="w-full text-xs py-2 px-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors cursor-pointer"
        >
          Add suggested item to cart
        </button>
      )}
    </div>
  );
}
