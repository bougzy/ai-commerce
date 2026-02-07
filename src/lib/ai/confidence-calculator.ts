import type { SessionProfile } from "@/types/session";
import type { RecommendationFactor } from "@/types/ai";

export function calculateConfidence(
  profile: SessionProfile,
  factors: RecommendationFactor[]
): number {
  const interactionBase = Math.min(
    0.4,
    Math.log2(profile.interactionCount + 1) / 10
  );

  let dataSignals = 0;
  if (profile.viewedProductIds.length > 0) dataSignals++;
  if (Object.keys(profile.viewedCategories).length >= 2) dataSignals++;
  if (profile.priceRange.average > 0) dataSignals++;
  if (Object.keys(profile.tagAffinity).length >= 3) dataSignals++;
  if (profile.searchQueries.length > 0) dataSignals++;
  const dataCompleteness = (dataSignals / 5) * 0.3;

  const factorScores = factors.map((f) => f.weight);
  if (factorScores.length === 0) return Math.min(1, interactionBase + dataCompleteness);

  const maxFactor = Math.max(...factorScores);
  const variance =
    factorScores.reduce((sum, s) => sum + Math.pow(s - maxFactor, 2), 0) /
    factorScores.length;
  const factorAgreement = Math.max(0, 0.3 - variance);

  return Math.min(1, interactionBase + dataCompleteness + factorAgreement);
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence < 0.3) return "I'm still learning your preferences";
  if (confidence < 0.6) return "Based on what I've seen so far";
  if (confidence < 0.8) return "I'm fairly confident you'll like this";
  return "This is a strong match for you";
}
