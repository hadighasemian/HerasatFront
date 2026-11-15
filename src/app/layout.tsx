import React from "react";
import type { Metadata } from "next";
import "./css/globals.css";
import { ThemeModeScript, ThemeProvider } from "flowbite-react";
import { ThemeInit } from "../../.flowbite-react/init";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/customizerContext";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "داشبورد مس بات",
  description: "مدیریت مس بات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeModeScript />
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
