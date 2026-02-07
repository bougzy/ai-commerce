"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Search,
} from "lucide-react";
import { useAiStore } from "@/stores/ai-store";
import GlassPanel from "@/components/ui/GlassPanel";
import AiChatMessage from "./AiChatMessage";
import AiTypingIndicator from "./AiTypingIndicator";

const quickActions = [
  { label: "Recommend something", icon: Sparkles },
  { label: "Analyze my cart", icon: ShoppingBag },
  { label: "What's trending?", icon: TrendingUp },
  { label: "Find headphones", icon: Search },
];

export default function AiChatWidget() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, widgetState, sendMessage, toggleWidget } =
    useAiStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (widgetState === "expanded") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [widgetState]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {widgetState === "collapsed" && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWidget}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center cursor-pointer hover:shadow-purple-500/50 transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-950 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded chat panel */}
      <AnimatePresence>
        {widgetState === "expanded" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col"
          >
            <GlassPanel
              intensity="heavy"
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-emerald-400">Online</p>
                  </div>
                </div>
                <button
                  onClick={toggleWidget}
                  className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="px-4 py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Hi! I&apos;m your AI shopping assistant
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        I can recommend products, analyze your cart, and help you
                        find the best deals.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.label)}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-left"
                        >
                          <action.icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <AiChatMessage key={msg.id} message={msg} />
                ))}

                {isLoading && <AiTypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2 focus-within:border-purple-500/50 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 rounded-lg bg-purple-500 text-white disabled:opacity-30 hover:bg-purple-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
