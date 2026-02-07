"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Trash2, ShoppingBag, Eye } from "lucide-react";
import { useOrderStore } from "@/stores/order-store";
import { getProductById } from "@/lib/data/products";
import { formatPrice, formatRelativeTime } from "@/lib/utils/format";
import Button from "@/components/ui/Button";
import GlassPanel from "@/components/ui/GlassPanel";

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);
  const deleteOrder = useOrderStore((s) => s.deleteOrder);

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
          <Package className="w-10 h-10 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-white">No orders yet</h1>
        <p className="text-gray-400">
          Once you place an order, it will appear here.
        </p>
        <Link href="/products">
          <Button variant="ai">
            <ShoppingBag className="w-4 h-4" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Your Orders</h1>
        <p className="text-gray-400 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <GlassPanel key={order.id} intensity="light" className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-mono text-gray-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(order.createdAt)} &middot;{" "}
                  {order.items.reduce((s, i) => s + i.quantity, 0)} item
                  {order.items.reduce((s, i) => s + i.quantity, 0) !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
              <span className="text-lg font-bold text-white">
                {formatPrice(order.total)}
              </span>
            </div>

            {/* Product thumbnails */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {order.items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <Link
                    key={item.productId}
                    href={`/products/${item.productId}`}
                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 hover:ring-2 hover:ring-purple-500/50 transition-all"
                    title={product.name}
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {item.quantity > 1 && (
                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href={`/orders/${order.id}`}>
                <Button variant="secondary" size="sm">
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Button>
              </Link>
              <button
                onClick={() => deleteOrder(order.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
