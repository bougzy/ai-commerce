"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { useOrderStore } from "@/stores/order-store";
import { getProductById } from "@/lib/data/products";
import { formatPrice, formatRelativeTime } from "@/lib/utils/format";
import Button from "@/components/ui/Button";
import GlassPanel from "@/components/ui/GlassPanel";
import { useRouter } from "next/navigation";

function OrderContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get("success") === "true";
  const order = useOrderStore((s) => s.getOrder(id));
  const deleteOrder = useOrderStore((s) => s.deleteOrder);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Order not found</h1>
        <p className="text-gray-400">
          This order may have been deleted or doesn&apos;t exist.
        </p>
        <Link href="/orders">
          <Button variant="secondary">View All Orders</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteOrder(order.id);
    router.push("/orders");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success banner */}
      {isSuccess && (
        <GlassPanel intensity="medium" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Order Confirmed!
              </h1>
              <p className="text-gray-400 mt-1">
                Thank you, {order.shippingAddress.fullName}! Your order has been
                placed successfully. A confirmation has been sent to{" "}
                {order.shippingAddress.email}.
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      {!isSuccess && (
        <div>
          <Link
            href="/orders"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to orders
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Order Details</h1>
        </div>
      )}

      {/* Order info */}
      <GlassPanel intensity="light" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Order ID</p>
              <p className="text-xs text-gray-500 font-mono">
                {order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Placed</p>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </GlassPanel>

      {/* Items */}
      <GlassPanel intensity="light" className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-sm font-medium text-white hover:text-purple-300 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qty: {item.quantity} &times;{" "}
                    {formatPrice(item.priceAtPurchase)}
                  </p>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatPrice(item.priceAtPurchase * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between text-white font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </GlassPanel>

      {/* Shipping */}
      <GlassPanel intensity="light" className="p-6 space-y-2">
        <h2 className="text-lg font-semibold text-white">Shipping To</h2>
        <div className="text-sm text-gray-300 space-y-1">
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.zipCode}
          </p>
          <p className="text-gray-500">{order.shippingAddress.email}</p>
        </div>
      </GlassPanel>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link href="/products" className="flex-1">
          <Button variant="ai" size="lg" className="w-full">
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Button>
        </Link>
        <Link href="/orders" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            View All Orders <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="text-center">
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 text-sm text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Delete this order
        </button>
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense>
      <OrderContent id={id} />
    </Suspense>
  );
}
