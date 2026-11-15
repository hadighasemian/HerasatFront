"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Dropdown, DropdownItem, Select, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import Pager from "@/components/Pager";
import { RequirePermission } from "@/components/AuthGuard";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toJalali } from "@/lib/jalali";
import type { Paginated, Role, UserItem } from "@/lib/types";
import UserFormModal from "./UserFormModal";
import ImportModal from "./ImportModal";

function UsersPage() {
  const { can, user: me } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<UserItem> | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [editId, setEditId] = useState<number | null | undefined>(undefined); // undefined = closed, null = new
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Paginated<UserItem>>("/api/admin/users", { params: { q: q || undefined, status: status || undefined, role: role || undefined, page } });
      setData(data);
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [q, status, role, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (can("roles.view")) api.get<{ roles: Role[] }>("/api/admin/roles").then((r) => setRoles(r.data.roles)).catch(() => undefined);
  }, [can]);

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

  return (
    <>
      <PageTitle
        title="مدیریت کاربران"
        actions={
          <>
            {can("users.import") ? (
              <Button color="lightprimary" size="sm" onClick={() => setImportOpen(true)}>
                <Icon icon="solar:upload-line-duotone" height={18} className="me-1" />
                ورود از فایل
              </Button>
            ) : null}
            {can("users.create") ? (
              <Button color="primary" size="sm" onClick={() => setEditId(null)}>
                <Icon icon="solar:user-plus-line-duotone" height={18} className="me-1" />
                افزودن کاربر
              </Button>
            ) : null}
          </>
        }
      />
      <CardBox>
        {flash ? (
          <Alert color={flash.ok ? "lightsuccess" : "lighterror"} className="mb-4" onDismiss={() => setFlash(null)}>
            {flash.text}
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-3 mb-5">
          <TextInput className="form-control w-72" placeholder="جستجو: نام، نام خانوادگی، کد پرسنلی" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <Select className="select-md w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
            <option value="locked">قفل‌شده</option>
          </Select>
          {roles.length ? (
            <Select className="select-md w-56" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
              <option value="">همه نقش‌ها</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.display_name}
                </option>
              ))}
            </Select>
          ) : null}
          {loading ? <Spinner className="self-center" /> : null}
        </div>
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>کد پرسنلی</TableHeadCell>
              <TableHeadCell>نام</TableHeadCell>
              <TableHeadCell>امور / محل خدمت</TableHeadCell>
              <TableHeadCell>نقش‌ها</TableHeadCell>
              <TableHeadCell>وضعیت</TableHeadCell>
              <TableHeadCell>آخرین ورود</TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">عملیات</span>
              </TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {data?.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell dir="ltr" className="text-end">
                    {u.personnel_code}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {u.first_name} {u.last_name}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{u.department || "—"}</div>
                    <div className="text-darklink">{u.work_location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles
                        .filter((r) => r.name !== "user")
                        .map((r) => (
                          <Badge key={r.name} color="lightprimary">
                            {r.display_name}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.is_active ? <Badge color="lightsuccess">فعال</Badge> : <Badge color="lighterror">غیرفعال</Badge>}
                      {u.is_locked ? <Badge color="lightwarning">قفل</Badge> : null}
                      {u.must_change_password ? <Badge color="lightgray">رمز پیش‌فرض</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{toJalali(u.last_login_at)}</TableCell>
                  <TableCell>
                    <Dropdown label="" dismissOnClick renderTrigger={() => (
                      <button type="button" aria-label="عملیات" className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary flex items-center justify-center">
                        <Icon icon="solar:menu-dots-bold" height={20} />
                      </button>
                    )}>
                      {can("users.update") ? <DropdownItem onClick={() => setEditId(u.id)}>ویرایش</DropdownItem> : null}
                      {can("users.reset_password") ? (
                        <DropdownItem onClick={() => action(() => api.post(`/api/admin/users/${u.id}/reset-password`), "رمز عبور این کاربر به کد ملی بازنشانی شود؟")}>بازنشانی رمز به کد ملی</DropdownItem>
                      ) : null}
                      {can("users.update") && u.is_locked ? <DropdownItem onClick={() => action(() => api.post(`/api/admin/users/${u.id}/unlock`))}>رفع قفل</DropdownItem> : null}
                      {can("users.update") && u.id !== me?.id ? (
                        <DropdownItem onClick={() => action(() => api.put(`/api/admin/users/${u.id}`, { is_active: !u.is_active }))}>{u.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}</DropdownItem>
                      ) : null}
                      {can("users.delete") && u.id !== me?.id ? (
                        <DropdownItem className="text-error" onClick={() => action(() => api.delete(`/api/admin/users/${u.id}`), `کاربر ${u.first_name} ${u.last_name} حذف شود؟`)}>
                          حذف
                        </DropdownItem>
                      ) : null}
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
              {data && !data.data.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-darklink">
                    کاربری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        {data ? <Pager page={data.meta.current_page} last={data.meta.last_page} total={data.meta.total} onChange={setPage} /> : null}
      </CardBox>
      <UserFormModal
        open={editId !== undefined}
        userId={editId ?? null}
        roles={roles}
        onClose={() => setEditId(undefined)}
        onSaved={() => {
          setEditId(undefined);
          setFlash({ ok: true, text: "اطلاعات کاربر ذخیره شد." });
          load();
        }}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onDone={load} />
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={["users.view"]}>
      <UsersPage />
    </RequirePermission>
  );
}
