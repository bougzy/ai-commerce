"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Brain, ShoppingBag, TrendingUp } from "lucide-react";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import ProductRecommendationRow from "@/components/products/ProductRecommendationRow";
import ProductGrid from "@/components/products/ProductGrid";
import Button from "@/components/ui/Button";
import GlassPanel from "@/components/ui/GlassPanel";

const features = [
  {
    icon: Brain,
    title: "Smart Recommendations",
    description: "Learns your preferences as you browse and suggests products tailored to you.",
  },
  {
    icon: ShoppingBag,
    title: "Cart Optimizer",
    description: "Analyzes your cart to find bundles, alternatives, and potential savings.",
  },
  {
    icon: TrendingUp,
    title: "Session Learning",
    description: "Gets smarter with every interaction — confidence grows as it learns your taste.",
  },
];

export default function HomePage() {
  const trending = [...products]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
            <Sparkles className="w-4 h-4" />
            Powered by Simulated AI
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Shop smarter with
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI-powered insights
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience an intelligent shopping assistant that learns your preferences,
            recommends products, and optimizes your cart — all using heuristic algorithms
            that simulate real AI behavior.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/products">
              <Button variant="ai" size="lg">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <GlassPanel key={feature.title} intensity="light" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Recommended for You
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <ProductRecommendationRow context="home" limit={4} />
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        </div>
        <ProductGrid products={trending} />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <h2 className="text-2xl font-bold text-white">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all text-center space-y-2"
            >
              <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
