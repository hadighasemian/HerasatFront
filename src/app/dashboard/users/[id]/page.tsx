"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Badge, Button, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import InfoRow from "@/components/InfoRow";
import LoginHistoryCard from "@/components/LoginHistoryCard";
import { RequirePermission } from "@/components/AuthGuard";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toJalali, toPersianDigits } from "@/lib/jalali";
import type { Role, UserItem } from "@/lib/types";
import UserFormModal from "../UserFormModal";
import AssignRolesModal from "../AssignRolesModal";

type Sensitive = { national_code: string | null; phone: string | null };

function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, user: me } = useAuth();
  const [u, setU] = useState<UserItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [sensitive, setSensitive] = useState<Sensitive | null>(null);
  const [revealing, setRevealing] = useState(false);
  const isSelf = !!u && u.id === me?.id;

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: UserItem }>(`/api/admin/users/${id}`);
      setU(data.user);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    if (can("roles.view")) api.get<{ roles: Role[] }>("/api/admin/roles").then((r) => setRoles(r.data.roles)).catch(() => undefined);
  }, [can]);

  const reveal = async () => {
    if (sensitive) {
      setSensitive(null);
      return;
    }
    setRevealing(true);
    try {
      const { data } = await api.get<Sensitive>(`/api/admin/users/${id}/sensitive`);
      setSensitive(data);
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    } finally {
      setRevealing(false);
    }
  };

  const action = async (fn: () => Promise<{ data: { message?: string } }>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      const { data } = await fn();
      setFlash({ ok: true, text: data.message || "انجام شد." });
      load();
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  };

  const canAssign = can("users.assign_roles") && roles.length > 0 && !isSelf;

  return (
    <>
      <PageTitle
        title={u ? `پروفایل ${u.first_name} ${u.last_name}` : "پروفایل کاربر"}
        actions={
          <>
            <Button as={Link} href="/dashboard/users" size="sm" color="lightprimary">
              <Icon icon="solar:arrow-right-line-duotone" height={18} className="me-1" />
              بازگشت به کاربران
            </Button>
            {u && can("users.update") ? (
              <Button size="sm" color="primary" onClick={() => setEditOpen(true)} data-testid="btn-edit-user">
                <Icon icon="solar:pen-line-duotone" height={18} className="me-1" />
                ویرایش
              </Button>
            ) : null}
            {u && canAssign ? (
              <Button size="sm" color="lightsecondary" onClick={() => setRolesOpen(true)} data-testid="btn-assign-roles">
                <Icon icon="solar:shield-user-line-duotone" height={18} className="me-1" />
                تخصیص نقش
              </Button>
            ) : null}
            {u && can("users.reset_password") ? (
              <Button
                size="sm"
                color="lightwarning"
                data-testid="btn-reset-password"
                onClick={() => action(() => api.post(`/api/admin/users/${u.id}/reset-password`), "رمز عبور این کاربر به کد ملی بازنشانی شود؟")}
              >
                <Icon icon="solar:key-minimalistic-square-2-line-duotone" height={18} className="me-1" />
                بازنشانی رمز
              </Button>
            ) : null}
            {u && can("users.update") && u.is_locked ? (
              <Button size="sm" color="lightsuccess" onClick={() => action(() => api.post(`/api/admin/users/${u.id}/unlock`))}>
                رفع قفل
              </Button>
            ) : null}
          </>
        }
      />
      {flash ? (
        <Alert color={flash.ok ? "lightsuccess" : "lighterror"} className="mb-4" onDismiss={() => setFlash(null)}>
          {flash.text}
        </Alert>
      ) : null}
      {error ? <Alert color="lighterror">{error}</Alert> : null}
      {!u && !error ? <Spinner /> : null}
      {u ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-30" data-testid="user-detail">
          <CardBox className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-lightprimary text-primary flex items-center justify-center text-xl font-semibold shrink-0">
                {u.first_name?.[0] || "?"}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {u.first_name} {u.last_name}
                </h2>
                <p className="text-sm text-darklink" dir="ltr">
                  {u.personnel_code}
                </p>
              </div>
            </div>
            <InfoRow label="کد پرسنلی" value={u.personnel_code} ltr />
            <InfoRow label="نام" value={u.first_name} />
            <InfoRow label="نام خانوادگی" value={u.last_name} />
            <InfoRow label="نام پدر" value={u.father_name} />
            <InfoRow label="نوع استخدام" value={u.employment_type} />
            <InfoRow label="امور سازمانی" value={u.department} />
            <InfoRow label="محل خدمت" value={u.work_location} />
            <InfoRow label="کد ملی" value={<span data-testid="national-code">{sensitive ? sensitive.national_code : u.national_code_masked}</span>} ltr />
            <InfoRow label="تلفن" value={sensitive ? sensitive.phone : u.phone_masked} ltr />
            {can("users.view_sensitive") ? (
              <div className="pt-3">
                <Button size="xs" color="lightprimary" onClick={reveal} disabled={revealing} data-testid="btn-reveal">
                  <Icon icon={sensitive ? "solar:eye-closed-line-duotone" : "solar:eye-line-duotone"} height={16} className="me-1" />
                  {sensitive ? "پنهان کردن کد ملی و تلفن" : "نمایش کامل کد ملی و تلفن"}
                </Button>
                <p className="text-xs text-darklink mt-1">هر بار نمایش در گزارش رویدادها ثبت می‌شود.</p>
              </div>
            ) : null}
          </CardBox>
          <div className="space-y-[30px]">
            <CardBox>
              <h3 className="font-semibold mb-3">وضعیت حساب</h3>
              <div className="flex flex-wrap gap-1 mb-3" data-testid="user-status">
                {u.is_active ? <Badge color="lightsuccess">فعال</Badge> : <Badge color="lighterror">غیرفعال</Badge>}
                {u.is_locked ? <Badge color="lightwarning">قفل</Badge> : null}
                {u.must_change_password ? <Badge color="lightgray">رمز پیش‌فرض</Badge> : null}
              </div>
              <InfoRow label="آخرین ورود" value={toJalali(u.last_login_at)} />
              <InfoRow label="آخرین تغییر رمز" value={toJalali(u.password_changed_at ?? null)} />
              <InfoRow label="تلاش ناموفق" value={toPersianDigits(u.failed_login_attempts ?? 0)} />
              {u.is_locked ? <InfoRow label="قفل تا" value={toJalali(u.locked_until ?? null)} /> : null}
              <InfoRow label="تاریخ ایجاد" value={toJalali(u.created_at)} />
            </CardBox>
            <CardBox>
              <h3 className="font-semibold mb-3">نقش‌ها</h3>
              <div className="flex flex-wrap gap-1" data-testid="user-roles">
                {u.roles.map((r) => (
                  <Badge key={r.name} color={r.name === "user" ? "lightgray" : "lightprimary"}>
                    {r.display_name || r.name}
                  </Badge>
                ))}
              </div>
              {isSelf ? <p className="text-xs text-darklink mt-3">نقش‌های حساب خودتان را نمی‌توانید تغییر دهید.</p> : null}
            </CardBox>
          </div>
        </div>
      ) : null}
      {u ? <LoginHistoryCard endpoint={`/api/admin/users/${u.id}/login-history`} note="ورودهای موفق و ناموفق، خروج و قفل شدن حساب این کاربر (۵۰ مورد آخر)." /> : null}
      {u ? (
        <>
          <UserFormModal
            open={editOpen}
            userId={u.id}
            roles={roles}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false);
              setFlash({ ok: true, text: "اطلاعات کاربر ذخیره شد." });
              setSensitive(null);
              load();
            }}
          />
          <AssignRolesModal
            open={rolesOpen}
            user={u}
            roles={roles}
            onClose={() => setRolesOpen(false)}
            onSaved={(nu) => {
              setRolesOpen(false);
              setU(nu);
              setFlash({ ok: true, text: "نقش‌های کاربر ذخیره شد." });
            }}
          />
        </>
      ) : null}
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={["users.view"]}>
      <UserDetailPage />
    </RequirePermission>
  );
}
