"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Alert, Button, Label, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import Captcha, { CaptchaValue } from "@/components/Captcha";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { toPersianDigits } from "@/lib/jalali";

interface Meta {
  categories: { key: string; label: string }[];
  limits: { max_attachments: number; max_attachment_kb: number; allowed_extensions: string[] };
}

export default function ReportForm() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [captcha, setCaptcha] = useState<CaptchaValue>({ id: "", answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Meta>("/api/public/report-categories").then((r) => setMeta(r.data)).catch(() => setError("ارتباط با سرور برقرار نشد."));
  }, []);

  const limits = meta?.limits;
  const accept = (limits?.allowed_extensions || ["jpg", "jpeg", "png", "pdf"]).map((e) => "." + e).join(",");

  const onFiles = (list: FileList | null) => {
    if (!list || !limits) return;
    const picked = Array.from(list);
    const errs: string[] = [];
    const ok = picked.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (!limits.allowed_extensions.includes(ext)) {
        errs.push(`نوع فایل «${f.name}» مجاز نیست.`);
        return false;
      }
      if (f.size > limits.max_attachment_kb * 1024) {
        errs.push(`حجم فایل «${f.name}» بیش از حد مجاز است.`);
        return false;
      }
      return true;
    });
    const merged = [...files, ...ok].slice(0, limits.max_attachments);
    if (files.length + ok.length > limits.max_attachments) errs.push(`حداکثر ${toPersianDigits(limits.max_attachments)} فایل مجاز است.`);
    setFiles(merged);
    setErrors((p) => ({ ...p, attachments: errs.join(" ") }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setErrors({});
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("category", category);
    if (contact.trim()) fd.append("contact", contact);
    files.forEach((f) => fd.append("attachments[]", f));
    fd.append("captcha_id", captcha.id);
    fd.append("captcha", captcha.answer);
    try {
      const { data } = await api.post<{ tracking_code: string }>("/api/public/reports", fd);
      setCode(data.tracking_code);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
      setCaptchaKey((k) => k + 1);
    } finally {
      setSending(false);
    }
  };

  if (code) {
    return (
      <CardBox className="max-w-2xl mx-auto text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-lightsuccess text-success flex items-center justify-center">
          <Icon icon="solar:check-circle-line-duotone" height={40} />
        </div>
        <h2 className="text-2xl font-semibold mt-4">گزارش شما ثبت شد</h2>
        <p className="text-darklink mt-2">کد پیگیری زیر را یادداشت کنید. این کد فقط همین یک بار نمایش داده می‌شود و قابل بازیابی نیست.</p>
        <div className="my-6 flex items-center justify-center gap-3">
          <code dir="ltr" className="text-2xl font-mono font-bold tracking-wider text-primary select-all" data-testid="tracking-code">
            {code}
          </code>
          <Button
            size="sm"
            color="lightprimary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
              } catch {
                /* ignore */
              }
            }}
          >
            {copied ? "کپی شد" : "کپی"}
          </Button>
        </div>
        <Button as={Link} href="/report/track" color="primary" className="mx-auto w-fit">
          پیگیری گزارش
        </Button>
      </CardBox>
    );
  }

  return (
    <CardBox className="max-w-3xl mx-auto">
      <Alert color="lightinfo" className="mb-6">
        <span>
          ثبت گزارش نیازی به ورود ندارد و نشانی IP یا مشخصات مرورگر شما ذخیره نمی‌شود. لطفاً از درج اطلاعات شخصی
          غیرضروری خودداری کنید.
        </span>
      </Alert>
      {error ? (
        <Alert color="lighterror" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {!meta ? (
        <div className="py-10 text-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="r-category" className="mb-2 block">
              موضوع گزارش *
            </Label>
            <Select id="r-category" className="select-md" value={category} onChange={(e) => setCategory(e.target.value)} required color={errors.category ? "failure" : undefined}>
              <option value="">انتخاب کنید</option>
              {meta.categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
            {errors.category ? <p className="text-error text-sm mt-1">{errors.category}</p> : null}
          </div>
          <div>
            <Label htmlFor="r-title" className="mb-2 block">
              عنوان *
            </Label>
            <TextInput id="r-title" className="form-control" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} required color={errors.title ? "failure" : undefined} />
            {errors.title ? <p className="text-error text-sm mt-1">{errors.title}</p> : null}
          </div>
          <div>
            <Label htmlFor="r-desc" className="mb-2 block">
              شرح گزارش *
            </Label>
            <Textarea id="r-desc" rows={7} maxLength={5000} className="form-control-textarea" value={description} onChange={(e) => setDescription(e.target.value)} required color={errors.description ? "failure" : undefined} />
            <div className="flex justify-between text-xs text-darklink mt-1">
              <span>{errors.description ? <span className="text-error">{errors.description}</span> : "حداقل ۲۰ کاراکتر"}</span>
              <span>{toPersianDigits(description.length)} / ۵۰۰۰</span>
            </div>
          </div>
          <div>
            <Label htmlFor="r-contact" className="mb-2 block">
              راه ارتباطی (اختیاری)
            </Label>
            <TextInput id="r-contact" className="form-control" maxLength={200} placeholder="شماره تماس یا ایمیل، در صورت تمایل" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-files" className="mb-2 block">
              پیوست (اختیاری)
            </Label>
            <input ref={fileRef} id="r-files" type="file" multiple accept={accept} onChange={(e) => onFiles(e.target.files)} className="block w-full text-sm text-darklink file:me-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-lightprimary file:text-primary" />
            <p className="text-xs text-darklink mt-1">
              حداکثر {toPersianDigits(limits!.max_attachments)} فایل، هر فایل تا {toPersianDigits(Math.round(limits!.max_attachment_kb / 1024))} مگابایت ({limits!.allowed_extensions.join("، ")})
            </p>
            {Object.entries(errors)
              .filter(([k, v]) => k.startsWith("attachments") && v)
              .map(([k, v]) => (
                <p key={k} className="text-error text-sm mt-1">
                  {v}
                </p>
              ))}
            {files.length ? (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm border border-ld rounded-md px-3 py-2">
                    <span dir="ltr" className="truncate">
                      {f.name}
                    </span>
                    <button type="button" className="text-error" aria-label="حذف" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      <Icon icon="solar:trash-bin-minimalistic-line-duotone" height={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Captcha value={captcha} onChange={setCaptcha} error={errors.captcha} reloadKey={captchaKey} />
          <Button type="submit" color="primary" className="w-full" disabled={sending}>
            {sending ? <Spinner size="sm" className="me-2" /> : null}
            ثبت گزارش
          </Button>
        </form>
      )}
    </CardBox>
  );
}
