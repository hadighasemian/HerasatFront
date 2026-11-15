"use client";

import React, { useState } from "react";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import StrengthMeter from "./StrengthMeter";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { passwordPolicyChecks } from "@/lib/password";
import type { Me } from "@/lib/types";

export default function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const { setUser } = useAuth();
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checks = passwordPolicyChecks(pw);
  const policyOk = checks.every((c) => c.ok);
  const match = pw.length > 0 && pw === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setError(null);
    setSuccess(null);
    try {
      const { data } = await api.post<{ message: string; user: Me }>("/api/auth/change-password", {
        current_password: current,
        password: pw,
        password_confirmation: confirm,
      });
      setSuccess(data.message);
      setCurrent("");
      setPw("");
      setConfirm("");
      setUser(data.user);
      onDone?.();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const type = show ? "text" : "password";
  return (
    <form onSubmit={submit} className="space-y-4" autoComplete="off">
      {success ? <Alert color="lightsuccess">{success}</Alert> : null}
      {error ? <Alert color="lighterror">{error}</Alert> : null}
      <div>
        <Label htmlFor="cp-current" className="mb-2 block">
          رمز عبور فعلی
        </Label>
        <TextInput id="cp-current" dir="ltr" type={type} className="form-control" autoComplete="current-password" maxLength={128} value={current} onChange={(e) => setCurrent(e.target.value)} required color={errors.current_password ? "failure" : undefined} />
        {errors.current_password ? <p className="text-error text-sm mt-1">{errors.current_password}</p> : null}
      </div>
      <div>
        <Label htmlFor="cp-new" className="mb-2 block">
          رمز عبور جدید
        </Label>
        <TextInput id="cp-new" dir="ltr" type={type} className="form-control" autoComplete="new-password" maxLength={128} value={pw} onChange={(e) => setPw(e.target.value)} required color={errors.password ? "failure" : undefined} />
        <StrengthMeter password={pw} />
        {errors.password ? <p className="text-error text-sm mt-1">{errors.password}</p> : null}
        <ul className="grid grid-cols-2 gap-1 mt-2 text-xs">
          {checks.map((c) => (
            <li key={c.text} className={`flex items-center gap-1 ${c.ok ? "text-success" : "text-darklink"}`}>
              <Icon icon={c.ok ? "solar:check-circle-line-duotone" : "solar:close-circle-line-duotone"} height={14} />
              {c.text}
            </li>
          ))}
          <li className="flex items-center gap-1 text-darklink col-span-2">
            <Icon icon="solar:info-circle-line-duotone" height={14} />
            نباید شامل کد پرسنلی یا کد ملی باشد
          </li>
        </ul>
      </div>
      <div>
        <Label htmlFor="cp-confirm" className="mb-2 block">
          تکرار رمز عبور جدید
        </Label>
        <TextInput id="cp-confirm" dir="ltr" type={type} className="form-control" autoComplete="new-password" maxLength={128} value={confirm} onChange={(e) => setConfirm(e.target.value)} required color={confirm && !match ? "failure" : undefined} />
        {confirm && !match ? <p className="text-error text-sm mt-1">تکرار رمز عبور مطابقت ندارد.</p> : null}
      </div>
      <label className="flex items-center gap-2 text-sm text-darklink cursor-pointer">
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} /> نمایش رمزها
      </label>
      <Button type="submit" color="primary" className="w-full" disabled={loading || !policyOk || !match || !current}>
        {loading ? <Spinner size="sm" className="me-2" /> : null}
        تغییر رمز عبور
      </Button>
    </form>
  );
}
