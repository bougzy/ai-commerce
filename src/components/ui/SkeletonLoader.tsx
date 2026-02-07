import { clsx } from "clsx";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "badge";
  className?: string;
}

export default function SkeletonLoader({
  variant = "text",
  className,
}: SkeletonLoaderProps) {
  if (variant === "card") {
    return (
      <div
        className={clsx(
          "animate-pulse rounded-2xl bg-white/5 border border-white/10",
          className
        )}
      >
        <div className="h-48 bg-white/10 rounded-t-2xl" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-white/10 rounded w-1/3 mt-4" />
        </div>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={clsx(
          "animate-pulse h-6 w-20 rounded-full bg-white/10",
          className
        )}
      />
    );
  }

  return (
    <div className={clsx("animate-pulse space-y-2", className)}>
      <div className="h-4 bg-white/10 rounded w-full" />
      <div className="h-4 bg-white/10 rounded w-5/6" />
      <div className="h-4 bg-white/10 rounded w-4/6" />
    </div>
  );
}
