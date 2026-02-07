export type CategoryId =
  | "electronics"
  | "clothing"
  | "home"
  | "sports"
  | "books"
  | "beauty";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: CategoryId;
  subcategory: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  inStock: boolean;
  bundleEligible: string[];
  popularityScore: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  relatedCategories: CategoryId[];
}
