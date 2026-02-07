"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";

interface CartItemProps {
  item: CartItemType;
  product: Product;
}

export default function CartItem({ item, product }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 capitalize mt-0.5">
          {product.category}
        </p>
        <p className="text-sm font-bold text-white mt-1">
          {formatPrice(product.price)}
        </p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.productId)}
          className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-medium text-white w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
