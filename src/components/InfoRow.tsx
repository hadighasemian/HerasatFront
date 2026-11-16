import React from "react";

/** One label/value line of a read-only info card. */
export default function InfoRow({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-ld last:border-0">
      <span className="text-darklink shrink-0">{label}</span>
      <span className="font-medium text-end min-w-0 break-words" dir={ltr ? "ltr" : undefined}>
        {value || "—"}
      </span>
    </div>
  );
}
