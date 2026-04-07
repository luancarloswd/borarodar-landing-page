import type { ReactNode } from "react";
import "./globals.css";

// Root layout: minimal wrapper. The actual layout is in [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
