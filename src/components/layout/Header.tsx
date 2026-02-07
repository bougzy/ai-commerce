"use client";

import Link from "next/link";
import { ShoppingCart, Sparkles, RotateCcw } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useSessionStore } from "@/stores/session-store";

export default function Header() {
  const items = useCartStore((s) => s.items);
  const resetSession = useSessionStore((s) => s.resetSession);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <span className="text-lg font-bold text-white">
            AI Commerce
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-300 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={resetSession}
            className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            title="Reset AI session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
