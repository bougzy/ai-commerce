import { NextResponse } from "next/server";
import type { RecommendProductsRequest } from "@/types/ai";
import {
  scoreAllProducts,
  applyQueryFilter,
  determineBadgeType,
} from "@/lib/ai/recommendation-engine";
import { generateReasoning, generateConversationalResponse, generateSessionInsight } from "@/lib/ai/reasoning-generator";
import { calculateConfidence } from "@/lib/ai/confidence-calculator";

export async function POST(request: Request) {
  const body: RecommendProductsRequest = await request.json();

  const delayBase = Math.min(
    300 + body.sessionProfile.interactionCount * 50,
    800
  );
  const delay = delayBase + Math.random() * 400;
  await new Promise((r) => setTimeout(r, delay));

  let scored = scoreAllProducts(body.sessionProfile, body.context);

  if (body.chatQuery) {
    const filtered = applyQueryFilter(scored, body.chatQuery);
    if (filtered.length > 0) {
      scored = filtered;
    }
  }

  if (body.context.currentPage !== "cart") {
    const cartIds = new Set(body.context.cartProductIds ?? []);
    scored = scored.filter((sp) => !cartIds.has(sp.product.id));
  }

  const topProducts = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, body.context.limit ?? 6);

  const recommendations = topProducts.map((sp) => {
    const badge = determineBadgeType(sp.product, sp.score, sp.factors);
    const confidence = calculateConfidence(body.sessionProfile, sp.factors);
    const reasoning = generateReasoning({
      product: sp.product,
      score: sp.score,
      factors: sp.factors,
      profile: body.sessionProfile,
    });

    return {
      productId: sp.product.id,
      score: Math.round(sp.score),
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
      badgeText: badge.badgeText,
      badgeType: badge.badgeType,
      factors: sp.factors,
    };
  });

  const message = generateConversationalResponse(
    recommendations,
    body.chatQuery,
    body.sessionProfile
  );
  const sessionInsight = generateSessionInsight(body.sessionProfile);

  const avgConfidence =
    recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.confidence, 0) /
        recommendations.length
      : 0.3;

  return NextResponse.json({
    recommendations,
    message,
    confidence: Math.round(avgConfidence * 100) / 100,
    sessionInsight,
    processingTimeMs: Math.round(delay),
  });
}
