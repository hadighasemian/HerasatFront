"use client";

import React, { useState } from "react";
import { Alert, Button, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";
import { api, errorMessage } from "@/lib/api";
import { toPersianDigits } from "@/lib/jalali";

type Result = Record<string, number> & { errors: { row: number; reason: string }[] };

const LABELS: Record<string, string> = {
  total_rows: "کل ردیف‌ها",
  created: "ایجاد شده",
  updated: "به‌روزرسانی شده",
  skipped_existing: "رد شده (موجود)",
  skipped_empty: "ردیف خالی",
  duplicates_in_file: "تکراری در فایل",
  invalid_national_code: "کد ملی نامعتبر",
  invalid_personnel_code: "کد پرسنلی نامعتبر",
  missing_required: "فاقد فیلد الزامی",
  national_code_conflict: "کد ملی متعلق به کاربر دیگر",
  unknown_role: "نقش ناشناخته",
};
const REASONS: Record<string, string> = {
  invalid_national_code: "کد ملی نامعتبر",
  invalid_personnel_code: "کد پرسنلی نامعتبر",
  missing_required: "فاقد فیلد الزامی",
  duplicate_in_file: "تکراری در فایل",
  national_code_conflict: "کد ملی تکراری",
  unknown_role: "نقش ناشناخته",
};

export default function ImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [update, setUpdate] = useState(false);
  const [dry, setDry] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("update_existing", update ? "1" : "0");
    fd.append("dry_run", dry ? "1" : "0");
    try {
      const { data } = await api.post<{ result: Result }>("/api/admin/users/import", fd, { timeout: 15 * 60 * 1000 });
      setResult(data.result);
      if (!dry) onDone();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={open} onClose={busy ? () => undefined : onClose} size="2xl">
      <ModalHeader>ورود گروهی کاربران</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <Alert color="lightinfo">
            فایل XLSX یا CSV با ستون‌های: شماره پرسنلی، نام، نام خانوادگی، کدملی و (اختیاری) نام پدر، نوع استخدام، امور سازمانی، محل خدمت، تلفن. رمز اولیه هر کاربر کد ملی اوست.
          </Alert>
          {error ? <Alert color="lighterror">{error}</Alert> : null}
          <input type="file" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm file:me-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-lightprimary file:text-primary" />
          <div className="flex items-center gap-2">
            <Checkbox id="imp-dry" checked={dry} onChange={() => setDry(!dry)} />
            <Label htmlFor="imp-dry">فقط بررسی (بدون ذخیره)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="imp-upd" checked={update} onChange={() => setUpdate(!update)} />
            <Label htmlFor="imp-upd">به‌روزرسانی اطلاعات کاربران موجود</Label>
          </div>
          {busy ? (
            <div className="flex items-center gap-2 text-darklink">
              <Spinner size="sm" /> در حال پردازش… (برای فایل‌های بزرگ ممکن است چند دقیقه طول بکشد)
            </div>
          ) : null}
          {result ? (
            <div>
              <h4 className="font-semibold mb-2">{dry ? "نتیجه بررسی" : "نتیجه ورود"}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(LABELS)
                  .filter(([k]) => typeof result[k] === "number")
                  .map(([k, l]) => (
                    <div key={k} className="flex justify-between border border-ld rounded-md px-3 py-2">
                      <span>{l}</span>
                      <span className="font-semibold">{toPersianDigits(result[k])}</span>
                    </div>
                  ))}
              </div>
              {result.errors.length ? (
                <div className="mt-3 max-h-40 overflow-auto text-xs text-error">
                  {result.errors.slice(0, 200).map((e, i) => (
                    <div key={i}>
                      ردیف {toPersianDigits(e.row)}: {REASONS[e.reason] || e.reason}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={run} disabled={!file || busy}>
          {dry ? "بررسی فایل" : "ورود کاربران"}
        </Button>
        <Button color="lighterror" onClick={onClose} disabled={busy}>
          بستن
        </Button>
      </ModalFooter>
    </Modal>
  );
}
