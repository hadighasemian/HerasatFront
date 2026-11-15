"use client";

import { AuthProvider } from "@/lib/auth";
import "@/lib/icons";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
