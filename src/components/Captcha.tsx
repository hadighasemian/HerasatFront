"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Label, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import { api } from "@/lib/api";

export interface CaptchaValue {
  id: string;
  answer: string;
}

/** Self-hosted image captcha (served by Laravel, no third-party service). */
export default function Captcha({
  value,
  onChange,
  error,
  reloadKey,
}: {
  value: CaptchaValue;
  onChange: (v: CaptchaValue) => void;
  error?: string;
  reloadKey?: number;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ id: string; image: string }>("/api/public/captcha");
      setImage(data.image);
      onChange({ id: data.id, answer: "" });
    } catch {
      setImage(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, reloadKey]);

  return (
    <div>
      <Label htmlFor="captcha" className="mb-2 block">
        کد امنیتی
      </Label>
      <div className="flex items-center gap-3">
        <div className="h-[60px] w-[180px] shrink-0 rounded-md border border-ld overflow-hidden flex items-center justify-center bg-white">
          {loading || !image ? (
            <Spinner size="sm" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="کد امنیتی" width={180} height={60} />
          )}
        </div>
        <button
          type="button"
          onClick={load}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-lightprimary hover:text-primary"
          title="کد جدید"
          aria-label="کد جدید"
        >
          <Icon icon="solar:refresh-line-duotone" height={22} />
        </button>
      </div>
      <TextInput
        id="captcha"
        className="form-control mt-3"
        dir="ltr"
        autoComplete="off"
        maxLength={10}
        placeholder="کد داخل تصویر را وارد کنید"
        value={value.answer}
        onChange={(e) => onChange({ ...value, answer: e.target.value })}
        color={error ? "failure" : undefined}
      />
      {error ? <p className="text-error text-sm mt-1">{error}</p> : null}
    </div>
  );
}
