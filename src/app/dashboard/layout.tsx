"use client";
import React, { useContext } from "react";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Header from "./layout/vertical/header/Header";
import { CustomizerContext } from "@/app/context/customizerContext";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";

function Shell({ children }: { children: React.ReactNode }) {
  const { isLayout } = useContext(CustomizerContext);
  const { user } = useAuth();
  const pathname = usePathname();
  // While the default password must be changed, show only the change-password form (no menu).
  if (user?.must_change_password && pathname === "/dashboard/change-password") {
    return <div className="min-h-screen bg-lightgray dark:bg-dark py-10 px-4">{children}</div>;
  }
  return (
    <div className="flex w-full min-h-screen">
      <div className="page-wrapper flex w-full">
        <Sidebar />
        <div className="body-wrapper w-full bg-lightgray dark:bg-dark">
          <Header />
          <div className={isLayout == "full" ? "w-full py-[30px] md:px-[30px] px-5" : "container mx-auto py-[30px]"}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <Shell>{children}</Shell>
    </AuthGuard>
  );
}
