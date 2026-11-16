"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import { RequirePermission } from "@/components/AuthGuard";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toPersianDigits } from "@/lib/jalali";
import type { Permission, Role } from "@/lib/types";

type Dialog = { kind: "role" } | { kind: "permission" } | null;

function RolesPage() {
  const { can, refresh, user: me } = useAuth();
  const iAmAdmin = !!me?.roles.some((r) => r.name === "admin");
  const canManage = can("roles.manage");
  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([api.get<{ roles: Role[] }>("/api/admin/roles"), api.get<{ permissions: Permission[] }>("/api/admin/permissions")]);
      setRoles(r.data.roles);
      setPerms(p.data.permissions);
      setSelected((s) => s ?? r.data.roles[0]?.id ?? null);
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const role = roles.find((r) => r.id === selected) || null;
  const isAdminRole = role?.name === "admin";
  // the admin role is editable, but only by an administrator (the API enforces the same rule)
  const locked = !canManage || (isAdminRole && !iAmAdmin);
  const lockedPerms = role?.locked_permissions || [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(role?.permissions || []);
  }, [role]);

  const groups = useMemo(() => {
    const g: Record<string, Permission[]> = {};
    perms.forEach((p) => (g[p.group || "سایر"] ||= []).push(p));
    return g;
  }, [perms]);

  const savePerms = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const { data } = await api.put<{ role: Role }>(`/api/admin/roles/${role.id}/permissions`, { permissions: Array.from(new Set([...checked, ...lockedPerms])) });
      setRoles(roles.map((r) => (r.id === role.id ? data.role : r)));
      setFlash({ ok: true, text: "دسترسی‌های نقش ذخیره شد." });
      refresh();
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const submitDialog = async () => {
    setFormErrors({});
    try {
      if (dialog?.kind === "role") {
        const { data } = await api.post<{ role: Role }>("/api/admin/roles", { ...form, permissions: [] });
        setSelected(data.role.id);
      } else {
        await api.post("/api/admin/permissions", form);
      }
      setDialog(null);
      setForm({});
      setFlash({ ok: true, text: "ذخیره شد." });
      await load();
    } catch (e) {
      setFormErrors({ ...fieldErrors(e), _: errorMessage(e) });
    }
  };

  const deleteRole = async () => {
    if (!role || !window.confirm(`نقش «${role.display_name}» حذف شود؟`)) return;
    try {
      await api.delete(`/api/admin/roles/${role.id}`);
      setSelected(null);
      setFlash({ ok: true, text: "نقش حذف شد." });
      load();
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  };

  const field = (key: string, label: string, ltr = false, hint?: string) => (
    <div>
      <Label htmlFor={`d-${key}`} className="mb-2 block">
        {label}
      </Label>
      <TextInput id={`d-${key}`} dir={ltr ? "ltr" : undefined} className="form-control" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} color={formErrors[key] ? "failure" : undefined} />
      {hint ? <p className="text-xs text-darklink mt-1">{hint}</p> : null}
      {formErrors[key] ? <p className="text-error text-xs mt-1">{formErrors[key]}</p> : null}
    </div>
  );

  return (
    <>
      <PageTitle
        title="نقش‌ها و دسترسی‌ها"
        actions={
          <>
            {can("permissions.manage") ? (
              <Button size="sm" color="lightprimary" onClick={() => { setForm({}); setFormErrors({}); setDialog({ kind: "permission" }); }}>
                تعریف دسترسی جدید
              </Button>
            ) : null}
            {canManage ? (
              <Button size="sm" color="primary" onClick={() => { setForm({}); setFormErrors({}); setDialog({ kind: "role" }); }}>
                <Icon icon="solar:add-circle-line-duotone" height={18} className="me-1" />
                نقش جدید
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-30">
        {/* self-start: a stretched card centres its content and leaves a gap above the list */}
        <CardBox className="lg:self-start">
          <h2 className="font-semibold mb-3">نقش‌ها</h2>
          {!roles.length ? <Spinner /> : null}
          <ul className="space-y-1">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={`w-full text-start px-3 py-2 rounded-md flex items-center justify-between gap-2 ${r.id === selected ? "bg-lightprimary text-primary" : "hover:bg-lightgray dark:hover:bg-dark"}`}
                >
                  <span>
                    <span className="block text-sm font-medium">{r.display_name}</span>
                    <span className="block text-xs text-darklink" dir="ltr">
                      {r.name}
                    </span>
                  </span>
                  <Badge color="lightgray">{toPersianDigits(r.users_count ?? 0)}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </CardBox>
        <CardBox className="lg:col-span-2">
          {role ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-semibold">{role.display_name}</h2>
                  <p className="text-xs text-darklink">{role.title_en}</p>
                </div>
                <div className="flex gap-2">
                  {canManage && !role.is_system ? (
                    <Button size="sm" color="lighterror" onClick={deleteRole}>
                      حذف نقش
                    </Button>
                  ) : null}
                  {!locked ? (
                    <Button size="sm" color="primary" onClick={savePerms} disabled={saving}>
                      {saving ? <Spinner size="sm" className="me-2" /> : null}
                      ذخیره دسترسی‌ها
                    </Button>
                  ) : null}
                </div>
              </div>
              {isAdminRole ? (
                <Alert color="lightinfo" className="mb-4" data-testid="admin-role-hint">
                  دسترسی‌های نقش مدیر سیستم قابل تغییر است. دسترسی‌های دارای علامت قفل (مدیریت کاربران و نقش‌ها) همیشه برای این نقش باقی می‌مانند تا دسترسی مدیریت سامانه از دست نرود.
                  {!iAmAdmin ? " فقط مدیر سیستم می‌تواند این نقش را ویرایش کند." : ""}
                </Alert>
              ) : null}
              <div className="space-y-5">
                {Object.entries(groups).map(([g, list]) => (
                  <div key={g}>
                    <h3 className="text-sm font-semibold text-darklink mb-2">{g}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {list.map((p) => {
                        const required = lockedPerms.includes(p.name);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2 p-2 rounded-md border border-ld ${locked || required ? "cursor-not-allowed" : "cursor-pointer"}`}
                            data-testid={`perm-${p.name}`}
                          >
                            <Checkbox
                              className="mt-1"
                              disabled={locked || required}
                              checked={required || checked.includes(p.name)}
                              onChange={() => setChecked(checked.includes(p.name) ? checked.filter((x) => x !== p.name) : [...checked, p.name])}
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm">{p.display_name}</span>
                              <span className="block text-xs text-darklink" dir="ltr">
                                {p.name}
                              </span>
                              {required ? (
                                <span className="flex items-center gap-1 text-xs text-warning mt-1">
                                  <Icon icon="solar:lock-keyhole-minimalistic-line-duotone" height={14} />
                                  الزامی برای مدیر سیستم (قابل حذف نیست)
                                </span>
                              ) : null}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-darklink">یک نقش را انتخاب کنید.</p>
          )}
        </CardBox>
      </div>

      <Modal show={!!dialog} onClose={() => setDialog(null)}>
        <ModalHeader>{dialog?.kind === "role" ? "نقش جدید" : "تعریف دسترسی (اقدام) جدید"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {formErrors._ ? <Alert color="lighterror">{formErrors._}</Alert> : null}
            {dialog?.kind === "role" ? (
              <>
                {field("display_name", "عنوان فارسی")}
                {field("title_en", "عنوان انگلیسی", true)}
                {field("name", "شناسه", true, "حروف کوچک انگلیسی، عدد و _ (مثلاً shift_supervisor)")}
                {field("description", "توضیحات")}
              </>
            ) : (
              <>
                {field("display_name", "عنوان فارسی")}
                {field("name", "شناسه", true, "مانند reports.export")}
                {field("group", "گروه")}
                {field("description", "توضیحات")}
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={submitDialog}>
            ذخیره
          </Button>
          <Button color="lighterror" onClick={() => setDialog(null)}>
            انصراف
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={["roles.view"]}>
      <RolesPage />
    </RequirePermission>
  );
}
