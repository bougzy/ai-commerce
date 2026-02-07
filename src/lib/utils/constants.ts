export const SCORING_WEIGHTS = {
  categoryAffinity: 0.3,
  priceRangeFit: 0.25,
  tagAffinity: 0.2,
  popularity: 0.15,
  recencyBoost: 0.1,
} as const;

export const MAX_RECOMMENDATIONS = 6;

export const SIMULATED_DELAY = {
  min: 300,
  max: 1200,
} as const;

export const CONFIDENCE_LABELS: Record<string, string> = {
  low: "I'm still learning your preferences",
  mediumLow: "Based on what I've seen so far",
  medium: "I'm fairly confident you'll like this",
  high: "This is a strong match for you",
};
