"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import Pager from "@/components/Pager";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { api, errorMessage } from "@/lib/api";
import { toJalali } from "@/lib/jalali";
import type { LoginHistoryItem, Paginated, RoleRef } from "@/lib/types";

interface Profile {
  personnel_code: string;
  first_name: string;
  last_name: string;
  father_name: string | null;
  employment_type: string | null;
  department: string | null;
  work_location: string | null;
  national_code_masked: string | null;
  phone_masked: string | null;
  roles: RoleRef[];
  last_login_at: string | null;
  password_changed_at: string | null;
}

function Row({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-ld last:border-0">
      <span className="text-darklink">{label}</span>
      <span className="font-medium text-end" dir={ltr ? "ltr" : undefined}>
        {value || "—"}
      </span>
    </div>
  );
}

const RESULT_COLOR: Record<string, string> = {
  success: "success",
  failed: "failure",
  logout: "light",
  locked: "warning",
};

function clientLabel(row: LoginHistoryItem): string {
  return [row.browser, row.os].filter(Boolean).join(" / ") || "—";
}

/** Read-only profile: users cannot edit their own information (only an admin can). */
export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginPage, setLoginPage] = useState(1);
  const [history, setHistory] = useState<Paginated<LoginHistoryItem> | null>(null);
  const [lastLogin, setLastLogin] = useState<LoginHistoryItem | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ profile: Profile }>("/api/profile").then((r) => setP(r.data.profile)).catch((e) => setError(errorMessage(e)));
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get<Paginated<LoginHistoryItem> & { last_successful_login: LoginHistoryItem | null }>("/api/profile/login-history", {
        params: { page: loginPage, per_page: 10 },
      });
      setHistory(data);
      setLastLogin(data.last_successful_login);
    } catch (e) {
      setHistoryError(errorMessage(e));
    }
  }, [loginPage]);

  useEffect(() => {
    const t = setTimeout(loadHistory, 150);
    return () => clearTimeout(t);
  }, [loadHistory]);

  return (
    <>
      <PageTitle title="پروفایل من" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-30">
        <CardBox>
          <h2 className="text-lg font-semibold mb-2">اطلاعات حساب</h2>
          <p className="text-xs text-darklink mb-4">این اطلاعات فقط توسط مدیر سامانه قابل ویرایش است. در صورت مغایرت با حراست تماس بگیرید.</p>
          {error ? <p className="text-error">{error}</p> : null}
          {!p && !error ? <Spinner /> : null}
          {p ? (
            <div data-testid="profile">
              <Row label="نام" value={p.first_name} />
              <Row label="نام خانوادگی" value={p.last_name} />
              <Row label="کد پرسنلی" value={p.personnel_code} ltr />
              <Row label="نام پدر" value={p.father_name} />
              <Row label="کد ملی" value={p.national_code_masked} ltr />
              <Row label="تلفن" value={p.phone_masked} ltr />
              <Row label="امور سازمانی" value={p.department} />
              <Row label="محل خدمت" value={p.work_location} />
              <Row label="نوع استخدام" value={p.employment_type} />
              <Row
                label="نقش‌ها"
                value={
                  <span className="flex flex-wrap gap-1 justify-end">
                    {p.roles.map((r) => (
                      <Badge key={r.name} color="lightprimary">
                        {r.display_name || r.name}
                      </Badge>
                    ))}
                  </span>
                }
              />
              <Row label="آخرین ورود" value={toJalali(p.last_login_at)} />
              <Row label="آخرین تغییر رمز" value={toJalali(p.password_changed_at)} />
            </div>
          ) : null}
        </CardBox>
        <CardBox>
          <h2 className="text-lg font-semibold mb-4">تغییر رمز عبور</h2>
          <ChangePasswordForm />
        </CardBox>
      </div>

      <div className="mt-[30px]" data-testid="login-history">
        <CardBox>
          <h2 className="text-lg font-semibold mb-2">سابقه ورود</h2>
          <p className="text-xs text-darklink mb-4">فقط سابقه ورود به حساب خودتان نمایش داده می‌شود و قابل ویرایش نیست.</p>
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
          ) : (
            <p className="text-sm text-darklink mb-4">هنوز ورود موفقی ثبت نشده است.</p>
          )}
          {historyError ? <p className="text-error">{historyError}</p> : null}
          {!history && !historyError ? <Spinner /> : null}
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
              <Pager page={history.meta.current_page} last={history.meta.last_page} total={history.meta.total} onChange={setLoginPage} />
            </>
          ) : null}
        </CardBox>
      </div>
    </>
  );
}
