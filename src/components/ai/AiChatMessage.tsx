"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types/ai";
import type { Product } from "@/types/product";
import { getProductById } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import AiConfidenceBar from "./AiConfidenceBar";

interface AiChatMessageProps {
  message: ChatMessage;
}

export default function AiChatMessage({ message }: AiChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1.5`}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-purple-500/20 text-white rounded-2xl rounded-br-md"
            : "bg-white/5 text-gray-200 rounded-2xl rounded-bl-md"
        } px-4 py-2.5`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">
              AI Assistant
            </span>
          </div>
        )}

        <p className="text-sm leading-relaxed">{message.content}</p>

        {message.recommendations && message.recommendations.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.recommendations.slice(0, 3).map((rec) => {
              const product = getProductById(rec.productId);
              if (!product) return null;
              return (
                <a
                  key={rec.productId}
                  href={`/products/${rec.productId}`}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <Badge
                    text={rec.badgeText}
                    type={rec.badgeType}
                    className="text-[10px] shrink-0"
                  />
                </a>
              );
            })}
          </div>
        )}

        {message.optimizations && message.optimizations.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.optimizations.slice(0, 3).map((opt, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-white/5 text-xs"
              >
                <p className="font-medium text-white">{opt.title}</p>
                <p className="text-gray-400 mt-0.5">{opt.description}</p>
                {opt.estimatedSaving != null && opt.estimatedSaving > 0 && (
                  <p className="text-emerald-400 mt-1">
                    Save {formatPrice(opt.estimatedSaving)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
