import { NextResponse } from "next/server";
import type { CartAdvisorRequest } from "@/types/ai";
import { analyzeCart } from "@/lib/ai/cart-advisor";
import {
  generateCartSummary,
  generatePriceSensitivityInsight,
} from "@/lib/ai/reasoning-generator";

export async function POST(request: Request) {
  const body: CartAdvisorRequest = await request.json();

  const delay = 400 + Math.random() * 600;
  await new Promise((r) => setTimeout(r, delay));

  const optimizations = analyzeCart(body.cart, body.sessionProfile);

  const totalSaving = optimizations.reduce(
    (sum, o) => sum + (o.estimatedSaving ?? 0),
    0
  );

  const summary = generateCartSummary(optimizations);
  const priceSensitivityInsight = generatePriceSensitivityInsight(
    body.sessionProfile
  );

  const avgConfidence =
    optimizations.length > 0
      ? optimizations.reduce((sum, o) => sum + o.confidence, 0) /
        optimizations.length
      : 0.3;

  return NextResponse.json({
    optimizations,
    summary,
    totalPotentialSaving: totalSaving,
    priceSensitivityInsight,
    confidence: Math.round(avgConfidence * 100) / 100,
    processingTimeMs: Math.round(delay),
  });
}
