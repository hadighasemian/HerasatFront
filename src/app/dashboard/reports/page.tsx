"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Select, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import Pager from "@/components/Pager";
import { RequirePermission } from "@/components/AuthGuard";
import { REPORT_PERMISSIONS } from "../layout/vertical/sidebar/Sidebaritems";
import { api, errorMessage } from "@/lib/api";
import { toJalali, toPersianDigits } from "@/lib/jalali";
import { REPORT_STATUS } from "@/lib/status";
import { useAuth } from "@/lib/auth";
import type { Paginated, ReportItem } from "@/lib/types";

function ReportsInbox() {
  const params = useSearchParams();
  const router = useRouter();
  const { can } = useAuth();
  const seeAll = can(["reports.review", "reports.view_all"]);
  const [status, setStatus] = useState(params.get("status") || "");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<ReportItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Paginated<ReportItem>>("/api/reports", { params: { status: status || undefined, q: q || undefined, page } });
      setData(data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status, q, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <PageTitle title="گزارش‌های مردمی" />
      <CardBox>
        <div className="flex flex-wrap gap-3 mb-5">
          <TextInput className="form-control w-64" placeholder="جستجو در عنوان یا ۴ رقم آخر کد" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          {seeAll ? (
            <Select className="select-md w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(REPORT_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          ) : (
            <span className="text-sm text-darklink self-center">فقط گزارش‌های تأییدشده نمایش داده می‌شوند.</span>
          )}
          {loading ? <Spinner className="self-center" /> : null}
        </div>
        {error ? <p className="text-error mb-3">{error}</p> : null}
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>شناسه</TableHeadCell>
              <TableHeadCell>عنوان</TableHeadCell>
              <TableHeadCell>موضوع</TableHeadCell>
              <TableHeadCell>وضعیت</TableHeadCell>
              <TableHeadCell>پیوست</TableHeadCell>
              <TableHeadCell>تاریخ ثبت</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {data?.data.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/reports/${r.id}`)}>
                  <TableCell dir="ltr" className="text-end">…{r.tracking_hint}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/reports/${r.id}`} className="font-medium hover:text-primary">
                      {r.title}
                    </Link>
                  </TableCell>
                  <TableCell>{r.category_label}</TableCell>
                  <TableCell>
                    <Badge color={REPORT_STATUS[r.status]?.color}>{REPORT_STATUS[r.status]?.label || r.status}</Badge>
                  </TableCell>
                  <TableCell>{toPersianDigits(r.attachments_count)}</TableCell>
                  <TableCell>{toJalali(r.created_at)}</TableCell>
                </TableRow>
              ))}
              {data && !data.data.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-darklink">
                    گزارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        {data ? <Pager page={data.meta.current_page} last={data.meta.last_page} total={data.meta.total} onChange={setPage} /> : null}
      </CardBox>
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={REPORT_PERMISSIONS}>
      <Suspense>
        <ReportsInbox />
      </Suspense>
    </RequirePermission>
  );
}
