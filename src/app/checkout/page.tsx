"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, CreditCard } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { getProductById } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils/format";
import type { ShippingAddress } from "@/types/cart";
import Button from "@/components/ui/Button";
import GlassPanel from "@/components/ui/GlassPanel";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const total = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Nothing to checkout</h1>
        <p className="text-gray-400">Your cart is empty.</p>
        <Link href="/products">
          <Button variant="ai">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const isValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.zipCode.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isProcessing) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));

    const orderId = placeOrder(form);
    if (orderId) {
      router.push(`/orders/${orderId}?success=true`);
    }
  };

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping */}
            <GlassPanel intensity="light" className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="123 Main St"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="New York"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={form.zipCode}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      placeholder="10001"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Fake payment */}
            <GlassPanel intensity="light" className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Payment (Simulated)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Card Number
                  </label>
                  <input
                    type="text"
                    defaultValue="4242 4242 4242 4242"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm outline-none cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Expiry
                    </label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      CVC
                    </label>
                    <input
                      type="text"
                      defaultValue="123"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Payment is simulated — no real charges will be made.
                </p>
              </div>
            </GlassPanel>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-2">
            <GlassPanel intensity="medium" className="p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-semibold text-white">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm text-white font-medium">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="ai"
                size="lg"
                className="w-full"
                disabled={!isValid || isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Place Order —{" "}
                    {formatPrice(total)}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                This is a demo — no real payment is processed
              </p>
            </GlassPanel>
          </div>
        </div>
      </form>
    </div>
  );
}
