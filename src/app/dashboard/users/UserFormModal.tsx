"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, TextInput, ToggleSwitch } from "flowbite-react";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Role, UserItem } from "@/lib/types";

const FIELDS: { key: string; label: string; ltr?: boolean; required?: boolean }[] = [
  { key: "personnel_code", label: "کد پرسنلی", ltr: true, required: true },
  { key: "national_code", label: "کد ملی", ltr: true, required: true },
  { key: "first_name", label: "نام", required: true },
  { key: "last_name", label: "نام خانوادگی", required: true },
  { key: "father_name", label: "نام پدر" },
  { key: "employment_type", label: "نوع استخدام" },
  { key: "department", label: "امور سازمانی" },
  { key: "work_location", label: "محل خدمت" },
  { key: "phone", label: "تلفن", ltr: true },
];

export default function UserFormModal({
  open,
  userId,
  roles,
  onClose,
  onSaved,
}: {
  open: boolean;
  userId: number | null; // null = create
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { can, user: me } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<UserItem | null>(null);
  const [active, setActive] = useState(true);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editing = userId !== null;
  const canRoles = can("users.assign_roles") && roles.length > 0 && detail?.id !== me?.id;

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setErrors({});
    setError(null);
    setDetail(null);
    if (!editing) {
      setValues({});
      setActive(true);
      setRoleIds([]);
      return;
    }
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    api
      .get<{ user: UserItem }>(`/api/admin/users/${userId}`)
      .then(({ data }) => {
        const u = data.user;
        setDetail(u);
        setValues({
          personnel_code: u.personnel_code,
          first_name: u.first_name,
          last_name: u.last_name,
          father_name: u.father_name || "",
          employment_type: u.employment_type || "",
          department: u.department || "",
          work_location: u.work_location || "",
        });
        setActive(u.is_active);
        setRoleIds(u.roles.map((r) => r.id!).filter(Boolean));
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [open, userId, editing]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      FIELDS.forEach((f) => {
        const v = values[f.key];
        // sensitive fields are only sent when the admin typed a new value
        if ((f.key === "national_code" || f.key === "phone") && editing && !v) return;
        payload[f.key] = v ?? "";
      });
      if (editing) {
        payload.is_active = active;
        await api.put(`/api/admin/users/${userId}`, payload);
        if (canRoles) await api.put(`/api/admin/users/${userId}/roles`, { roles: roleIds });
      } else {
        payload.roles = roleIds;
        await api.post("/api/admin/users", payload);
      }
      onSaved();
    } catch (e) {
      setErrors(fieldErrors(e));
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const assignable = roles.filter((r) => r.name !== "user");

  return (
    <Modal show={open} onClose={onClose} size="3xl">
      <ModalHeader>{editing ? "ویرایش کاربر" : "افزودن کاربر"}</ModalHeader>
      <ModalBody>
        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {error ? <Alert color="lighterror">{error}</Alert> : null}
            {!editing ? <Alert color="lightinfo">رمز عبور اولیه کاربر، کد ملی اوست و در اولین ورود باید تغییر کند.</Alert> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={`uf-${f.key}`} className="mb-2 block">
                    {f.label}
                    {f.required && !editing ? " *" : ""}
                  </Label>
                  <TextInput
                    id={`uf-${f.key}`}
                    dir={f.ltr ? "ltr" : undefined}
                    className="form-control"
                    autoComplete="off"
                    placeholder={
                      editing && f.key === "national_code"
                        ? `${detail?.national_code_masked || ""} (برای تغییر وارد کنید)`
                        : editing && f.key === "phone"
                          ? `${detail?.phone_masked || ""} (برای تغییر وارد کنید)`
                          : undefined
                    }
                    value={values[f.key] || ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    color={errors[f.key] ? "failure" : undefined}
                  />
                  {errors[f.key] ? <p className="text-error text-xs mt-1">{errors[f.key]}</p> : null}
                </div>
              ))}
            </div>
            {editing ? (
              <ToggleSwitch checked={active} label="حساب فعال است" onChange={setActive} disabled={detail?.id === me?.id} />
            ) : null}
            {(editing ? canRoles : can("users.assign_roles") && roles.length > 0) ? (
              <div>
                <Label className="mb-2 block">نقش‌ها (نقش «کاربر» همیشه اختصاص دارد)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assignable.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={roleIds.includes(r.id)} onChange={() => setRoleIds(roleIds.includes(r.id) ? roleIds.filter((x) => x !== r.id) : [...roleIds, r.id])} />
                      {r.display_name}
                    </label>
                  ))}
                </div>
                {errors.roles ? <p className="text-error text-xs mt-1">{errors.roles}</p> : null}
              </div>
            ) : null}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={save} disabled={saving || loading}>
          {saving ? <Spinner size="sm" className="me-2" /> : null}
          ذخیره
        </Button>
        <Button color="lighterror" onClick={onClose}>
          انصراف
        </Button>
      </ModalFooter>
    </Modal>
  );
}
