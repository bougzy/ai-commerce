"use client";

import { clsx } from "clsx";

interface AiConfidenceBarProps {
  confidence: number;
  showLabel?: boolean;
}

export default function AiConfidenceBar({
  confidence,
  showLabel = false,
}: AiConfidenceBarProps) {
  const pct = Math.round(confidence * 100);

  const barColor =
    pct < 30
      ? "bg-gray-500"
      : pct < 60
        ? "bg-blue-500"
        : pct < 80
          ? "bg-emerald-500"
          : "bg-purple-500 shadow-sm shadow-purple-500/50";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Confidence</span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500">
          {pct < 30
            ? "Still learning your preferences"
            : pct < 60
              ? "Based on early signals"
              : pct < 80
                ? "Fairly confident"
                : "Strong match"}
        </p>
      )}
    </div>
  );
}
