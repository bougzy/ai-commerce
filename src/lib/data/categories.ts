import type { Category, CategoryId } from "@/types/product";

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Gadgets, audio, and smart devices",
    relatedCategories: ["home"],
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "Apparel, footwear, and accessories",
    relatedCategories: ["sports", "beauty"],
  },
  {
    id: "home",
    name: "Home & Living",
    description: "Furniture, decor, and kitchen essentials",
    relatedCategories: ["electronics"],
  },
  {
    id: "sports",
    name: "Sports & Fitness",
    description: "Equipment, gear, and activewear",
    relatedCategories: ["clothing"],
  },
  {
    id: "books",
    name: "Books",
    description: "Fiction, non-fiction, and educational",
    relatedCategories: [],
  },
  {
    id: "beauty",
    name: "Beauty & Care",
    description: "Skincare, haircare, and wellness",
    relatedCategories: ["clothing"],
  },
];

export function getCategoryById(id: CategoryId): Category {
  return categories.find((c) => c.id === id)!;
}

export function getCategoryName(id: CategoryId): string {
  return getCategoryById(id).name;
}
