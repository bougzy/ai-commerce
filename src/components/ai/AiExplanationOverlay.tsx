"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain } from "lucide-react";
import type { ProductRecommendation } from "@/types/ai";
import GlassPanel from "@/components/ui/GlassPanel";
import AiConfidenceBar from "./AiConfidenceBar";

interface AiExplanationOverlayProps {
  recommendation: ProductRecommendation;
  onClose: () => void;
}

export default function AiExplanationOverlay({
  recommendation,
  onClose,
}: AiExplanationOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 mt-2 z-50 w-72"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <GlassPanel intensity="heavy" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">
                AI Reasoning
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            {recommendation.reasoning}
          </p>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">
              Scoring Factors
            </p>
            {recommendation.factors
              .sort((a, b) => b.weight - a.weight)
              .map((factor) => (
                <div key={factor.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{factor.name}</span>
                    <span className="text-gray-500">
                      {Math.round(factor.weight * 100)}%
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500/60 rounded-full"
                      style={{ width: `${Math.min(100, factor.weight * 300)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <AiConfidenceBar
            confidence={recommendation.confidence}
            showLabel
          />
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}
