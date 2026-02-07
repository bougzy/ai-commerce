"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { CartOptimization, CartAdvisorResponse } from "@/types/ai";
import { useSessionStore } from "@/stores/session-store";
import { useCartStore } from "@/stores/cart-store";
import GlassPanel from "@/components/ui/GlassPanel";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import CartOptimizationCard from "@/components/cart/CartOptimizationCard";
import AiConfidenceBar from "./AiConfidenceBar";

export default function AiCartAdvisorPanel() {
  const [optimizations, setOptimizations] = useState<CartOptimization[]>([]);
  const [summary, setSummary] = useState("");
  const [insight, setInsight] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(true);

  const profile = useSessionStore((s) => s.profile);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    if (cartItems.length === 0) {
      setLoading(false);
      setOptimizations([]);
      setSummary("");
      return;
    }

    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/cart-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: cartItems,
            sessionProfile: profile,
          }),
        });
        const data: CartAdvisorResponse = await res.json();
        setOptimizations(data.optimizations);
        setSummary(data.summary);
        setInsight(data.priceSensitivityInsight);
        setConfidence(data.confidence);
      } catch {
        setOptimizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [cartItems, profile.interactionCount]);

  return (
    <GlassPanel intensity="medium" className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">AI Cart Advisor</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader variant="text" />
          <SkeletonLoader variant="text" />
          <SkeletonLoader variant="text" />
        </div>
      ) : cartItems.length === 0 ? (
        <p className="text-sm text-gray-400">
          Add items to your cart and I&apos;ll suggest optimizations!
        </p>
      ) : (
        <>
          {summary && (
            <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
          )}

          {insight && (
            <p className="text-xs text-purple-300 italic">{insight}</p>
          )}

          {confidence > 0 && <AiConfidenceBar confidence={confidence} />}

          <div className="space-y-3">
            {optimizations.map((opt, i) => (
              <CartOptimizationCard key={i} optimization={opt} />
            ))}
          </div>

          {optimizations.length === 0 && (
            <p className="text-sm text-gray-400">
              Your cart looks great! No optimization suggestions right now.
            </p>
          )}
        </>
      )}
    </GlassPanel>
  );
}
