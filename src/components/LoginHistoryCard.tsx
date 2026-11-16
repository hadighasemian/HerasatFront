"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import Pager from "@/components/Pager";
import { api, errorMessage } from "@/lib/api";
import { toJalali } from "@/lib/jalali";
import type { LoginHistoryItem, Paginated } from "@/lib/types";

const RESULT_COLOR: Record<string, string> = {
  success: "success",
  failed: "failure",
  logout: "light",
  locked: "warning",
};

function clientLabel(row: LoginHistoryItem): string {
  return [row.browser, row.os].filter(Boolean).join(" / ") || "—";
}

/** Read-only login history (successful/failed logins, logouts, lockouts) from the given endpoint. */
export default function LoginHistoryCard({ endpoint, note }: { endpoint: string; note: string }) {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<Paginated<LoginHistoryItem> | null>(null);
  const [lastLogin, setLastLogin] = useState<LoginHistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Paginated<LoginHistoryItem> & { last_successful_login: LoginHistoryItem | null }>(endpoint, {
        params: { page, per_page: 10 },
      });
      setHistory(data);
      setLastLogin(data.last_successful_login);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [endpoint, page]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="mt-[30px]" data-testid="login-history">
      <CardBox>
        <h2 className="text-lg font-semibold mb-2">سابقه ورود</h2>
        <p className="text-xs text-darklink mb-4">{note}</p>
        {lastLogin ? (
          <div className="rounded-tw bg-lightsuccess dark:bg-lightsuccess p-4 mb-5" data-testid="last-login">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                <Icon icon="solar:login-3-line-duotone" height={20} />
              </div>
              <div>
                <div className="font-semibold">آخرین ورود موفق</div>
                <div className="text-sm mt-1">{toJalali(lastLogin.occurred_at)}</div>
                <div className="text-sm text-darklink mt-1" dir="ltr">
                  {lastLogin.ip || "—"} — {clientLabel(lastLogin)}
                </div>
              </div>
            </div>
          </div>
        ) : history ? (
          <p className="text-sm text-darklink mb-4">هنوز ورود موفقی ثبت نشده است.</p>
        ) : null}
        {error ? <p className="text-error">{error}</p> : null}
        {!history && !error ? <Spinner /> : null}
        {history ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableHeadCell>زمان</TableHeadCell>
                  <TableHeadCell>نتیجه</TableHeadCell>
                  <TableHeadCell>نشانی IP</TableHeadCell>
                  <TableHeadCell>مرورگر و سیستم</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-border dark:divide-darkborder">
                  {history.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-xs">{toJalali(row.occurred_at)}</TableCell>
                      <TableCell>
                        <Badge color={RESULT_COLOR[row.result] || "light"}>{row.result_label}</Badge>
                      </TableCell>
                      <TableCell dir="ltr" className="text-end text-xs">
                        {row.ip || "—"}
                      </TableCell>
                      <TableCell className="text-xs">{clientLabel(row)}</TableCell>
                    </TableRow>
                  ))}
                  {!history.data.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-darklink">
                        سابقه‌ای یافت نشد.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <Pager page={history.meta.current_page} last={history.meta.last_page} total={history.meta.total} onChange={setPage} />
          </>
        ) : null}
      </CardBox>
    </div>
  );
}
