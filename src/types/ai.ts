export type BadgeType = "best-match" | "value" | "trending" | "complement" | "new-for-you";

export interface RecommendationFactor {
  name: string;
  weight: number;
  detail: string;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  confidence: number;
  reasoning: string;
  badgeText: string;
  badgeType: BadgeType;
  factors: RecommendationFactor[];
}

export type CartOptimizationType =
  | "bundle"
  | "alternative"
  | "remove-duplicate"
  | "price-alert"
  | "quantity-discount";

export interface CartOptimization {
  type: CartOptimizationType;
  title: string;
  description: string;
  confidence: number;
  affectedProductIds: string[];
  suggestedProductId?: string;
  estimatedSaving?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  recommendations?: ProductRecommendation[];
  optimizations?: CartOptimization[];
}

export interface RecommendProductsRequest {
  sessionProfile: import("./session").SessionProfile;
  context: {
    currentPage: "home" | "products" | "product-detail" | "cart";
    currentProductId?: string;
    cartProductIds?: string[];
    limit?: number;
  };
  chatQuery?: string;
}

export interface RecommendProductsResponse {
  recommendations: ProductRecommendation[];
  message: string;
  confidence: number;
  sessionInsight: string;
  processingTimeMs: number;
}

export interface CartAdvisorRequest {
  cart: import("./cart").CartItem[];
  sessionProfile: import("./session").SessionProfile;
  chatQuery?: string;
}

export interface CartAdvisorResponse {
  optimizations: CartOptimization[];
  summary: string;
  totalPotentialSaving: number;
  priceSensitivityInsight: string;
  confidence: number;
  processingTimeMs: number;
}
