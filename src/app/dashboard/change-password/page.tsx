"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import FullLogo from "../layout/shared/logo/FullLogo";
import { useAuth } from "@/lib/auth";

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const forced = !!user?.must_change_password;
  return (
    <div className="max-w-lg mx-auto">
      <CardBox>
        {forced ? (
          <div className="flex justify-center mb-4">
            <FullLogo />
          </div>
        ) : null}
        <h1 className="text-xl font-semibold mb-4">تغییر رمز عبور</h1>
        {forced ? (
          <Alert color="lightwarning" className="mb-4">
            برای ادامه، لازم است رمز عبور پیش‌فرض (کد ملی) را به یک رمز قوی تغییر دهید.
          </Alert>
        ) : null}
        <ChangePasswordForm onDone={() => router.replace("/dashboard")} />
        {forced ? (
          <Button
            color="transparent"
            className="mt-4 mx-auto"
            onClick={async () => {
              await logout();
              router.replace("/auth/login");
            }}
          >
            خروج
          </Button>
        ) : null}
      </CardBox>
    </div>
  );
}
