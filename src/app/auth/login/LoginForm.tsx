"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import Captcha, { CaptchaValue } from "@/components/Captcha";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { toEnglishDigits } from "@/lib/jalali";
import type { AxiosError } from "axios";

/** Only allow same-site relative redirects (prevents open redirect via ?next=). */
function safeNext(next: string | null): string {
  if (next && /^\/dashboard(\/|$|\?)/.test(next) && !next.startsWith("//")) return next;
  return "/dashboard";
}

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [needCaptcha, setNeedCaptcha] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaValue>({ id: "", answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.must_change_password ? "/dashboard/change-password" : safeNext(params.get("next")));
    }
  }, [authLoading, user, router, params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(toEnglishDigits(username.trim()), password, needCaptcha ? captcha : undefined);
      setPassword("");
      // redirect happens in the effect above
    } catch (err) {
      const data = (err as AxiosError<{ captcha_required?: boolean }>).response?.data;
      setError(errorMessage(err));
      setPassword("");
      if (data?.captcha_required) {
        setNeedCaptcha(true);
        setCaptchaKey((k) => k + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" autoComplete="on">
      {error ? (
        <Alert color="lighterror" data-testid="login-error">
          {error}
        </Alert>
      ) : null}
      <div>
        <Label htmlFor="username" className="mb-2 block">
          کد پرسنلی
        </Label>
        <TextInput id="username" name="username" dir="ltr" className="form-control" inputMode="numeric" autoComplete="username" maxLength={20} required value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password" className="mb-2 block">
          رمز عبور
        </Label>
        <div className="relative">
          <TextInput id="password" name="password" dir="ltr" type={show ? "text" : "password"} className="form-control" autoComplete="current-password" maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-darklink" onClick={() => setShow(!show)} aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}>
            <Icon icon={show ? "solar:eye-closed-line-duotone" : "solar:eye-line-duotone"} height={20} />
          </button>
        </div>
        <p className="text-xs text-darklink mt-2">در اولین ورود، رمز عبور پیش‌فرض کد ملی شماست و باید آن را تغییر دهید.</p>
      </div>
      {needCaptcha ? <Captcha value={captcha} onChange={setCaptcha} reloadKey={captchaKey} /> : null}
      <Button type="submit" color="primary" className="w-full" disabled={loading}>
        {loading ? <Spinner size="sm" className="me-2" /> : null}
        ورود
      </Button>
    </form>
  );
}
