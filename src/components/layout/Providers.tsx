"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const AiChatWidget = dynamic(
  () => import("@/components/ai/AiChatWidget"),
  { ssr: false }
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AiChatWidget />
    </>
  );
}
