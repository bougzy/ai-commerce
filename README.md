# AI Commerce — Simulated AI Shopping Assistant

A full-featured e-commerce application with a simulated AI shopping assistant. The AI uses deterministic heuristic algorithms (not real ML) to deliver product recommendations, cart optimization suggestions, and personalized insights that improve throughout a user's browsing session.

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS v4** for styling (glassmorphism design)
- **Zustand** for state management (cart, session, AI chat)
- **Framer Motion** for animations
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Floating AI Chat Widget** — Ask for recommendations, cart analysis, or product discovery
- **Inline Recommendation Badges** — AI-generated badges on product cards ("Best for You", "Great Value", etc.)
- **Explanation Overlays** — Click any badge to see why the AI recommends a product with factor breakdowns
- **Cart Advisor Panel** — Automatic cart optimization suggestions on the cart page
- **Session Learning** — The AI gets smarter as you browse, building a preference profile in localStorage

## API Endpoints

### POST `/api/ai/recommend-products`

Returns personalized product recommendations based on session behavior.

**Request:**
```json
{
  "sessionProfile": { "...session data..." },
  "context": {
    "currentPage": "home | products | product-detail | cart",
    "currentProductId": "optional",
    "cartProductIds": ["optional"],
    "limit": 6
  },
  "chatQuery": "optional search text"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "productId": "elec-001",
      "score": 82,
      "confidence": 0.65,
      "reasoning": "You've been exploring Electronics products...",
      "badgeText": "Best for You",
      "badgeType": "best-match",
      "factors": [{ "name": "Category Affinity", "weight": 0.28, "detail": "..." }]
    }
  ],
  "message": "conversational response",
  "confidence": 0.65,
  "sessionInsight": "You seem to enjoy Electronics...",
  "processingTimeMs": 450
}
```

### POST `/api/ai/cart-advisor`

Analyzes cart contents and returns optimization suggestions.

**Request:**
```json
{
  "cart": [{ "productId": "elec-001", "quantity": 1, "addedAt": 1234567890 }],
  "sessionProfile": { "...session data..." }
}
```

**Response:**
```json
{
  "optimizations": [
    {
      "type": "bundle",
      "title": "Complete the set with Bluetooth Speaker",
      "description": "...",
      "confidence": 0.75,
      "estimatedSaving": 750
    }
  ],
  "summary": "I found 3 suggestions that could save you up to $12.50!",
  "totalPotentialSaving": 1250,
  "priceSensitivityInsight": "You tend to browse mid-range products...",
  "confidence": 0.65,
  "processingTimeMs": 600
}
```

---

## AI Recommendation Heuristics

### Composite Scoring Formula

Each product receives a composite score (0-100) computed as a weighted sum of five factors:

```
Score = (0.30 x CategoryAffinity)
      + (0.25 x PriceRangeFit)
      + (0.20 x TagAffinity)
      + (0.15 x Popularity)
      + (0.10 x RecencyBoost)
```

### Factor 1: Category Affinity (weight: 0.30)

Measures how much the user has browsed products in the same category (and related categories).

- Each product view increments a per-category counter
- Affinity is normalized: `views_in_category / total_views`
- Related categories (defined in `categories.ts`) contribute at 40% weight
- Example: If 6 of 10 views are Electronics, electronics products score ~60/100

### Factor 2: Price Range Fit (weight: 0.25)

Uses a Gaussian curve centered on the user's average browsed price:

```
score = 100 x exp(-2 x (normalizedDistance)^2)
```

Where `normalizedDistance = |productPrice - averagePrice| / priceRange`

- Products near the average score ~100
- Products far from the average drop off exponentially
- If no price data exists, defaults to 50 (neutral)

### Factor 3: Tag Affinity (weight: 0.20)

Accumulates affinity scores for product tags based on user behavior:

- **View a product:** +0.10 to each of its tags
- **Add to cart:** +0.25 to each tag (stronger signal)
- **Remove from cart:** -0.05 to each tag (negative signal)
- Score = average tag affinity across the product's tags, scaled to 0-100
- Clamped to [0, 1] per tag

### Factor 4: Popularity (weight: 0.15)

A pre-computed popularity score (0-100) plus a rating bonus:

```
score = popularityScore x 0.8 + rating x 4
```

This ensures popular, well-rated products always have a baseline score.

### Factor 5: Recency Boost (weight: 0.10)

Boosts products matching the user's most recent browsing:

- Checks the last 3 viewed products
- +60 if the product shares a category with recent views
- +15 per overlapping tag (max +40)
- Encourages "more like what you just saw" recommendations

### Penalties

- Products already in cart: -30
- Currently viewed product: -50
- Most recently viewed product: -20

### Badge Assignment

| Condition | Badge | Color |
|-----------|-------|-------|
| Score >= 85 | "Best for You" | Purple gradient |
| Top factor = Price + has discount | "Great Value" | Green gradient |
| Top factor = Popularity | "Trending" | Orange gradient |
| Top factor = Tag Affinity | "Similar to Viewed" | Blue gradient |
| Default | "New for You" | Pink gradient |

---

## Cart Optimization Heuristics

The cart advisor runs five independent checks:

### 1. Bundle Detection

Checks each cart product's `bundleEligible` list for products not yet in the cart. Suggests adding complementary products with a 15% estimated saving. **Confidence: 0.75**

### 2. Cheaper Alternatives

Only activates for users with "budget" or "moderate" price sensitivity. Finds products in the same category with overlapping tags that are 15%+ cheaper and rated 3.5+. **Confidence: 0.65**

### 3. Overlap Detection

Flags when the cart contains 2+ items in the same subcategory (e.g., two "audio" items), prompting the user to confirm intent. **Confidence: 0.55**

### 4. Price Sensitivity Alert

Triggers when the cart's average price per item exceeds the user's average browsed price by 50%+ (unless they're a "premium" shopper). **Confidence: 0.70**

### 5. Quantity Discount Suggestion

When a product has quantity 2-4, suggests buying one more for a potential multi-buy discount (estimated 10% saving). **Confidence: 0.50**

---

## Confidence Score Calculation

The confidence score (0-1) reflects how much behavioral data the system has:

```
confidence = interactionBase + dataCompleteness + factorAgreement
```

- **Interaction Base (max 0.4):** Logarithmic growth from interaction count
- **Data Completeness (max 0.3):** How many signal types exist (views, categories, price, tags, searches)
- **Factor Agreement (max 0.3):** Lower variance among scoring factors = higher confidence

### Learning Progression

| Interactions | Confidence | Behavior |
|:---:|:---:|---|
| 0-2 | 0.1-0.3 | Shows popular/trending. "Still learning your preferences." |
| 3-5 | 0.3-0.5 | Starts using category affinity. "I notice you like Electronics." |
| 6-10 | 0.5-0.7 | Uses price range + tags. "You prefer wireless audio in the $40-$80 range." |
| 11+ | 0.7-0.9 | Full personalization. "Strong match based on your preferences." |

---

## Architecture

```
src/
├── app/                          # Next.js App Router pages & API routes
├── components/
│   ├── ai/                       # Chat widget, badges, overlays, advisor
│   ├── cart/                     # Cart items, summary, optimization cards
│   ├── layout/                   # Header, footer, providers
│   ├── products/                 # Product cards, grid, detail, recommendation row
│   └── ui/                       # Button, GlassPanel, SkeletonLoader, Badge
├── lib/
│   ├── ai/                       # Heuristic engines (scoring, reasoning, confidence)
│   ├── data/                     # Product catalog & category definitions
│   └── utils/                    # Formatting & constants
├── stores/                       # Zustand stores (session, cart, AI chat)
└── types/                        # TypeScript interfaces
```

## Session Data

All session data is stored in `localStorage` under the key `ai-commerce-session`. Cart data is stored under `ai-commerce-cart`. Reset the AI session using the reset button (rotate icon) in the header.
