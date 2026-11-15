import React, { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import CardBox from "@/app/components/shared/CardBox";
import FullLogo from "@/app/dashboard/layout/shared/logo/FullLogo";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-muted dark:bg-dark">
      <div className="flex min-h-screen justify-center items-center px-4 py-10">
        <CardBox className="md:w-[450px] w-full border-none">
          <div className="flex justify-center">
            <FullLogo />
          </div>
          <h1 className="text-xl font-semibold text-center mt-6">ورود به سامانه</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
          <div className="text-center mt-6">
            <Link href="/" className="text-primary text-sm font-medium">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </CardBox>
      </div>
    </div>
  );
}
