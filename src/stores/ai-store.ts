"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  ChatMessage,
  ProductRecommendation,
  CartOptimization,
  RecommendProductsResponse,
  CartAdvisorResponse,
} from "@/types/ai";
import { useSessionStore } from "./session-store";
import { useCartStore } from "./cart-store";

type WidgetState = "collapsed" | "expanded";

interface AiStore {
  messages: ChatMessage[];
  isLoading: boolean;
  widgetState: WidgetState;
  currentRecommendations: ProductRecommendation[];

  sendMessage: (content: string) => Promise<void>;
  toggleWidget: () => void;
  setWidgetState: (state: WidgetState) => void;
  setRecommendations: (recs: ProductRecommendation[]) => void;
}

function detectIntent(
  message: string
): "recommend" | "cart-advice" | "explain" | "general" {
  const lower = message.toLowerCase();

  const cartKeywords = [
    "cart", "checkout", "optimize", "save money", "too expensive",
    "alternatives", "bundle", "deal", "cheaper",
  ];
  const explainKeywords = ["why", "explain", "how come", "reasoning", "because"];
  const recommendKeywords = [
    "recommend", "suggest", "show me", "find", "looking for",
    "what should", "any good", "best", "popular", "trending", "similar",
    "headphone", "shoe", "book", "laptop", "watch", "shirt",
  ];

  if (cartKeywords.some((k) => lower.includes(k))) return "cart-advice";
  if (explainKeywords.some((k) => lower.includes(k))) return "explain";
  if (recommendKeywords.some((k) => lower.includes(k))) return "recommend";
  return "general";
}

const generalResponses = [
  "I'm here to help you find the perfect products! Try asking me to recommend something, or I can analyze your cart.",
  "Want me to suggest products based on what you've been browsing? Just say 'recommend something'!",
  "I can help with product recommendations, cart optimization, and finding the best deals for you.",
  "Try asking me things like 'show me headphones', 'analyze my cart', or 'what's trending?' — I'm here to help!",
];

export const useAiStore = create<AiStore>()((set, get) => ({
  messages: [],
  isLoading: false,
  widgetState: "collapsed",
  currentRecommendations: [],

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    const intent = detectIntent(content);

    try {
      if (intent === "recommend" || intent === "explain") {
        const profile = useSessionStore.getState().profile;
        const cartItems = useCartStore.getState().items;

        const res = await fetch("/api/ai/recommend-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionProfile: profile,
            context: {
              currentPage: "home",
              cartProductIds: cartItems.map((i) => i.productId),
              limit: 4,
            },
            chatQuery: content,
          }),
        });

        const data: RecommendProductsResponse = await res.json();

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
          recommendations: data.recommendations,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false,
          currentRecommendations: data.recommendations,
        }));
      } else if (intent === "cart-advice") {
        const profile = useSessionStore.getState().profile;
        const cartItems = useCartStore.getState().items;

        if (cartItems.length === 0) {
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: "Your cart is empty! Add some products first and I'll help you optimize.",
            timestamp: Date.now(),
          };
          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
          }));
          return;
        }

        const res = await fetch("/api/ai/cart-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: cartItems,
            sessionProfile: profile,
            chatQuery: content,
          }),
        });

        const data: CartAdvisorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: `${data.summary} ${data.priceSensitivityInsight}`,
          timestamp: Date.now(),
          optimizations: data.optimizations,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false,
        }));
      } else {
        // General response
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
        const responseText =
          generalResponses[Math.floor(Math.random() * generalResponses.length)];

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: responseText,
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false,
        }));
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again!",
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },

  toggleWidget: () =>
    set((state) => ({
      widgetState: state.widgetState === "collapsed" ? "expanded" : "collapsed",
    })),

  setWidgetState: (widgetState) => set({ widgetState }),

  setRecommendations: (currentRecommendations) =>
    set({ currentRecommendations }),
}));
