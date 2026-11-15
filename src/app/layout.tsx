import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./css/globals.css";
import { ThemeModeScript, ThemeProvider } from "flowbite-react";
import { ThemeInit } from "../../.flowbite-react/init";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/customizerContext";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: "حراست مجتمع مس شهربابک",
    template: "%s | حراست مجتمع مس شهربابک",
  },
  description: "سامانه حراست مجتمع مس شهربابک",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Per-request CSP nonce generated in src/proxy.ts (makes every page dynamically rendered)
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeModeScript nonce={nonce} />
      </head>
      <body>
        <ThemeInit />
        <Providers>
          <ThemeProvider theme={customTheme}>
            <CustomizerContextProvider>{children}</CustomizerContextProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
