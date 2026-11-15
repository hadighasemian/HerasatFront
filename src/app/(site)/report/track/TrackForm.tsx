"use client";

import React, { useState } from "react";
import { Alert, Badge, Button, Label, Spinner, TextInput } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import Captcha, { CaptchaValue } from "@/components/Captcha";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { toJalali } from "@/lib/jalali";
import { REPORT_STATUS } from "@/lib/status";
import type { ReportStatus } from "@/lib/types";

interface TrackResult {
  status: string;
  status_label: string;
  submitted_at: string;
  updated_at: string;
}

export default function TrackForm() {
  const [code, setCode] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaValue>({ id: "", answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});
    setResult(null);
    try {
      const { data } = await api.post<TrackResult>("/api/public/reports/track", {
        tracking_code: code.trim().toUpperCase(),
        captcha_id: captcha.id,
        captcha: captcha.answer,
      });
      setResult(data);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setCaptchaKey((k) => k + 1);
    }
  };

  return (
    <CardBox className="max-w-xl mx-auto">
      {error ? (
        <Alert color="lighterror" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {result ? (
        <div className="mb-6 p-5 rounded-md border border-ld" data-testid="track-result">
          <div className="flex items-center justify-between">
            <span className="font-semibold">وضعیت</span>
            <Badge color={REPORT_STATUS[result.status as ReportStatus]?.color || "lightprimary"}>{result.status_label}</Badge>
          </div>
          <div className="flex justify-between text-sm text-darklink mt-3">
            <span>تاریخ ثبت</span>
            <span>{toJalali(result.submitted_at)}</span>
          </div>
          <div className="flex justify-between text-sm text-darklink mt-2">
            <span>آخرین به‌روزرسانی</span>
            <span>{toJalali(result.updated_at)}</span>
          </div>
        </div>
      ) : null}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label htmlFor="t-code" className="mb-2 block">
            کد پیگیری
          </Label>
          <TextInput id="t-code" dir="ltr" className="form-control font-mono" placeholder="XXXX-XXXX-XXXX-XXXX" maxLength={40} autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} required color={errors.tracking_code ? "failure" : undefined} />
        </div>
        <Captcha value={captcha} onChange={setCaptcha} error={errors.captcha} reloadKey={captchaKey} />
        <Button type="submit" color="primary" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          پیگیری
        </Button>
      </form>
    </CardBox>
  );
}
