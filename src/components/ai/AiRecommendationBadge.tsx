"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { ProductRecommendation } from "@/types/ai";
import Badge from "@/components/ui/Badge";
import AiExplanationOverlay from "./AiExplanationOverlay";

interface AiRecommendationBadgeProps {
  recommendation: ProductRecommendation;
}

export default function AiRecommendationBadge({
  recommendation,
}: AiRecommendationBadgeProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowOverlay(!showOverlay);
        }}
        className="flex items-center gap-1 cursor-pointer"
      >
        <Badge text={recommendation.badgeText} type={recommendation.badgeType} />
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
      </button>

      {showOverlay && (
        <AiExplanationOverlay
          recommendation={recommendation}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
