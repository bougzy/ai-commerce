import { clsx } from "clsx";
import type { BadgeType } from "@/types/ai";

interface BadgeProps {
  text: string;
  type?: BadgeType;
  className?: string;
}

const typeClasses: Record<BadgeType, string> = {
  "best-match": "bg-gradient-to-r from-purple-500 to-indigo-500",
  value: "bg-gradient-to-r from-emerald-500 to-teal-500",
  trending: "bg-gradient-to-r from-orange-500 to-amber-500",
  complement: "bg-gradient-to-r from-blue-500 to-cyan-500",
  "new-for-you": "bg-gradient-to-r from-pink-500 to-rose-500",
};

export default function Badge({ text, type = "best-match", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-sm",
        typeClasses[type],
        className
      )}
    >
      {text}
    </span>
  );
}
