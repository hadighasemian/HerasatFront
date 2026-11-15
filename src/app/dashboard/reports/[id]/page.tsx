"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Badge, Button, Label, Spinner, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import { RequirePermission } from "@/components/AuthGuard";
import { REPORT_PERMISSIONS } from "../../layout/vertical/sidebar/Sidebaritems";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { toJalali, toPersianDigits } from "@/lib/jalali";
import { REPORT_STATUS } from "@/lib/status";
import type { ReportDetail, ReportStatus } from "@/lib/types";

function statusLabel(s: string | null) {
  return s ? REPORT_STATUS[s as ReportStatus]?.label || s : "—";
}

function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<{ report: ReportDetail; can_review: boolean }>(`/api/reports/${encodeURIComponent(id)}`);
      setReport(data.report);
      setCanReview(data.can_review);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const review = async (decision: "approve" | "reject") => {
    setBusy(decision);
    setReviewError(null);
    try {
      const { data } = await api.post<{ report: ReportDetail; can_review: boolean }>(`/api/reports/${report!.id}/review`, { decision, note: note || null });
      setReport(data.report);
      setCanReview(data.can_review);
      setNote("");
    } catch (e) {
      const fe = fieldErrors(e);
      setReviewError(fe.note || fe.decision || errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (error)
    return (
      <>
        <PageTitle title="جزئیات گزارش" />
        <Alert color="lighterror">{error}</Alert>
      </>
    );
  if (!report) return <Spinner />;

  return (
    <>
      <PageTitle
        title={`گزارش …${report.tracking_hint}`}
        actions={
          <Button as={Link} href="/dashboard/reports" color="lightprimary" size="sm">
            بازگشت
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-30">
        <CardBox className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{report.title}</h2>
            <Badge color={REPORT_STATUS[report.status]?.color}>{statusLabel(report.status)}</Badge>
          </div>
          <div className="text-sm text-darklink flex flex-wrap gap-4 mt-2">
            <span>موضوع: {report.category_label}</span>
            <span>ثبت: {toJalali(report.created_at)}</span>
          </div>
          {/* rendered as plain text (React escapes it) – never as HTML */}
          <p className="whitespace-pre-wrap leading-8 mt-5 break-words">{report.description}</p>
          {report.contact ? (
            <div className="mt-5 p-3 rounded-md bg-lightgray dark:bg-dark text-sm">
              <span className="text-darklink">راه ارتباطی گزارش‌دهنده: </span>
              <span className="break-all">{report.contact}</span>
            </div>
          ) : null}
          {report.attachments.length ? (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">پیوست‌ها</h3>
              <ul className="space-y-2">
                {report.attachments.map((a) => (
                  <li key={a.id}>
                    <a className="flex items-center gap-2 text-primary hover:underline" href={`/api/reports/${report.id}/attachments/${a.id}`} rel="noopener noreferrer">
                      <Icon icon="solar:paperclip-line-duotone" height={18} />
                      <span dir="ltr">{a.name}</span>
                      <span className="text-xs text-darklink">({toPersianDigits(Math.ceil(a.size / 1024))} KB)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.review_note ? (
            <div className="mt-6 p-4 rounded-md border border-ld">
              <h3 className="font-semibold mb-1">یادداشت بررسی</h3>
              <p className="whitespace-pre-wrap text-sm">{report.review_note}</p>
              <p className="text-xs text-darklink mt-2">
                {report.reviewer} - {toJalali(report.reviewed_at)}
              </p>
            </div>
          ) : null}
        </CardBox>
        <div className="space-y-30">
          {canReview ? (
            <CardBox>
              <h3 className="font-semibold mb-3">بررسی گزارش</h3>
              {reviewError ? (
                <Alert color="lighterror" className="mb-3">
                  {reviewError}
                </Alert>
              ) : null}
              <Label htmlFor="note" className="mb-2 block">
                یادداشت (برای رد الزامی است)
              </Label>
              <Textarea id="note" rows={4} maxLength={2000} className="form-control-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex gap-2 mt-4">
                <Button color="success" className="flex-1" disabled={!!busy} onClick={() => review("approve")}>
                  {busy === "approve" ? <Spinner size="sm" className="me-2" /> : null}
                  تأیید
                </Button>
                <Button color="error" className="flex-1" disabled={!!busy} onClick={() => review("reject")}>
                  {busy === "reject" ? <Spinner size="sm" className="me-2" /> : null}
                  رد
                </Button>
              </div>
              <p className="text-xs text-darklink mt-3">گزارش تأییدشده برای «سرپرست حفاظت پرسنلی» قابل مشاهده خواهد بود.</p>
            </CardBox>
          ) : null}
          <CardBox>
            <h3 className="font-semibold mb-3">تاریخچه وضعیت</h3>
            <ol className="relative border-s border-ld ms-2">
              {report.history.map((h, i) => (
                <li key={i} className="mb-5 ms-4">
                  <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-sm font-medium">
                    {h.from ? `${statusLabel(h.from)} ← ` : ""}
                    {statusLabel(h.to)}
                  </p>
                  <p className="text-xs text-darklink">
                    {toJalali(h.at)}
                    {h.by ? ` - ${h.by}` : ""}
                  </p>
                  {h.note ? <p className="text-xs mt-1 whitespace-pre-wrap">{h.note}</p> : null}
                </li>
              ))}
            </ol>
          </CardBox>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={REPORT_PERMISSIONS}>
      <ReportView />
    </RequirePermission>
  );
}
