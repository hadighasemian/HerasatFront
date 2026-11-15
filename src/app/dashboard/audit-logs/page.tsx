"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import Pager from "@/components/Pager";
import { RequirePermission } from "@/components/AuthGuard";
import { api, errorMessage } from "@/lib/api";
import { toJalali } from "@/lib/jalali";

interface Log {
  id: number;
  action: string;
  user: { id: number; personnel_code: string; name: string } | null;
  subject_type: string | null;
  subject_id: number | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

function AuditPage() {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ data: Log[]; meta: { current_page: number; last_page: number; total: number } } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/audit-logs", { params: { action: action || undefined, page } });
      setData(data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [action, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <PageTitle title="گزارش رویدادها" />
      <CardBox>
        <div className="flex gap-3 mb-5">
          <TextInput dir="ltr" className="form-control w-64" placeholder="action prefix, e.g. auth." value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} />
          {loading ? <Spinner className="self-center" /> : null}
        </div>
        {error ? <p className="text-error">{error}</p> : null}
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>زمان</TableHeadCell>
              <TableHeadCell>رویداد</TableHeadCell>
              <TableHeadCell>کاربر</TableHeadCell>
              <TableHeadCell>موضوع</TableHeadCell>
              <TableHeadCell>IP</TableHeadCell>
              <TableHeadCell>جزئیات</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {data?.data.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-xs">{toJalali(l.created_at)}</TableCell>
                  <TableCell dir="ltr" className="text-end font-mono text-xs">
                    {l.action}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{l.user ? `${l.user.name} (${l.user.personnel_code})` : "—"}</TableCell>
                  <TableCell dir="ltr" className="text-end text-xs">
                    {l.subject_type ? `${l.subject_type.split("\\").pop()}#${l.subject_id}` : "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-end text-xs">
                    {l.ip || "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-xs font-mono max-w-xs truncate" title={l.meta ? JSON.stringify(l.meta) : ""}>
                    {l.meta ? JSON.stringify(l.meta) : ""}
                  </TableCell>
                </TableRow>
              ))}
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
    <RequirePermission permissions={["audit.view"]}>
      <AuditPage />
    </RequirePermission>
  );
}
