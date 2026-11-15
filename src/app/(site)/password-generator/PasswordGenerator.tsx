"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Checkbox, Label, RangeSlider, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import StrengthMeter from "@/components/StrengthMeter";
import { secureRandomInt } from "@/lib/password";
import { toPersianDigits } from "@/lib/jalali";

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
};
const AMBIGUOUS = /[O0oIl1|`'"]/g;

type Options = { length: number; upper: boolean; lower: boolean; digits: boolean; symbols: boolean; noAmbiguous: boolean; count: number };

function generate(o: Options): string {
  const groups = (["upper", "lower", "digits", "symbols"] as const)
    .filter((k) => o[k])
    .map((k) => (o.noAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
  if (!groups.length) return "";
  const all = groups.join("");
  // guarantee at least one char from each selected group, then fill and shuffle (Fisher–Yates)
  const chars = groups.map((g) => g[secureRandomInt(g.length)]);
  while (chars.length < o.length) chars.push(all[secureRandomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, o.length).join("");
}

export default function PasswordGenerator() {
  const [o, setO] = useState<Options>({ length: 16, upper: true, lower: true, digits: true, symbols: true, noAmbiguous: true, count: 1 });
  const [list, setList] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const run = useCallback(() => {
    setList(Array.from({ length: o.count }, () => generate(o)));
    setCopied(null);
  }, [o]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
  }, [run]);

  const copy = async (pw: string, i: number) => {
    try {
      await navigator.clipboard.writeText(pw);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 2000);
    } catch {
      /* clipboard may be unavailable over http; the user can select the text */
    }
  };

  const none = !o.upper && !o.lower && !o.digits && !o.symbols;
  const toggle = (k: keyof Options) => setO((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-30">
      <CardBox className="lg:col-span-2">
        <h2 className="text-lg font-semibold mb-4">تنظیمات</h2>
        <div className="mb-5">
          <Label htmlFor="pg-length" className="mb-2 flex justify-between">
            <span>طول رمز</span>
            <span className="font-semibold text-primary">{toPersianDigits(o.length)}</span>
          </Label>
          <RangeSlider id="pg-length" dir="ltr" min={8} max={64} value={o.length} onChange={(e) => setO({ ...o, length: Number(e.target.value) })} />
        </div>
        <div className="space-y-3 mb-5">
          {(
            [
              ["upper", "حروف بزرگ (A-Z)"],
              ["lower", "حروف کوچک (a-z)"],
              ["digits", "اعداد (0-9)"],
              ["symbols", "نمادها (!@#$...)"],
              ["noAmbiguous", "حذف کاراکترهای مشابه (0 O l 1 I)"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="flex items-center gap-2">
              <Checkbox id={`pg-${k}`} checked={o[k] as boolean} onChange={() => toggle(k)} />
              <Label htmlFor={`pg-${k}`}>{label}</Label>
            </div>
          ))}
        </div>
        <div className="mb-5">
          <Label htmlFor="pg-count" className="mb-2 block">
            تعداد رمز
          </Label>
          <TextInput
            id="pg-count"
            type="number"
            dir="ltr"
            min={1}
            max={20}
            className="form-control"
            value={o.count}
            onChange={(e) => setO({ ...o, count: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })}
          />
        </div>
        <Button color="primary" className="w-full" onClick={run} disabled={none}>
          <Icon icon="solar:refresh-line-duotone" height={20} className="me-2" />
          تولید مجدد
        </Button>
        {none ? <p className="text-error text-sm mt-2">حداقل یک نوع کاراکتر را انتخاب کنید.</p> : null}
      </CardBox>

      <CardBox className="lg:col-span-3">
        <h2 className="text-lg font-semibold mb-4">رمزهای تولیدشده</h2>
        <div className="space-y-4">
          {list.map((pw, i) => (
            <div key={i} className="p-4 rounded-md border border-ld">
              <div className="flex items-center gap-3">
                <code dir="ltr" className="flex-1 font-mono text-base break-all select-all text-dark dark:text-white">
                  {pw}
                </code>
                <Button size="sm" color={copied === i ? "success" : "lightprimary"} onClick={() => copy(pw, i)} aria-label="کپی">
                  <Icon icon={copied === i ? "solar:check-circle-line-duotone" : "solar:copy-line-duotone"} height={18} className="me-1" />
                  {copied === i ? "کپی شد" : "کپی"}
                </Button>
              </div>
              <StrengthMeter password={pw} />
            </div>
          ))}
        </div>
        <p className="text-xs text-darklink mt-5 leading-6">
          رمزها فقط در مرورگر شما و با مولد تصادفی امن (crypto.getRandomValues) ساخته می‌شوند و به هیچ سروری ارسال
          نمی‌شوند.
        </p>
      </CardBox>
    </div>
  );
}
