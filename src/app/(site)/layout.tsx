import React from "react";
import LpHeader from "@/app/components/landingpage/header/Header";
import Footer from "@/app/components/landingpage/footer/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landingpage min-h-screen flex flex-col bg-lightgray dark:bg-darkgray overflow-x-hidden">
      <LpHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
