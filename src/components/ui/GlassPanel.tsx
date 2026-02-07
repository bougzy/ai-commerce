import { clsx } from "clsx";
import type { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy";
}

const intensityClasses = {
  light: "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg",
  medium: "bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl",
  heavy: "bg-white/15 backdrop-blur-xl border border-white/25 shadow-2xl",
};

export default function GlassPanel({
  children,
  className,
  intensity = "medium",
}: GlassPanelProps) {
  return (
    <div className={clsx("rounded-2xl", intensityClasses[intensity], className)}>
      {children}
    </div>
  );
}
