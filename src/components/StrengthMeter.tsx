"use client";

import { passwordStrength } from "@/lib/password";

export default function StrengthMeter({ password }: { password: string }) {
  const s = passwordStrength(password);
  return (
    <div aria-live="polite">
      <div className="flex gap-1 mt-2" dir="ltr">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${password && i < Math.max(1, s.score) ? s.color : "bg-lightgray dark:bg-darkborder"}`} />
        ))}
      </div>
      <p className="text-xs text-darklink mt-1">
        قدرت رمز: <span className="font-semibold">{s.label}</span>
        {password ? <span> (حدود {s.entropyBits} بیت)</span> : null}
      </p>
    </div>
  );
}
