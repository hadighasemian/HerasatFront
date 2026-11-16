"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Checkbox, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";
import { api, errorMessage } from "@/lib/api";
import type { Role, UserItem } from "@/lib/types";

/** Assign roles to one user. The default "user" role is always kept by the API. */
export default function AssignRolesModal({
  open,
  user,
  roles,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: UserItem;
  roles: Role[];
  onClose: () => void;
  onSaved: (u: UserItem) => void;
}) {
  const [ids, setIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setIds(user.roles.map((r) => r.id!).filter(Boolean));
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, user]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put<{ user: UserItem }>(`/api/admin/users/${user.id}/roles`, { roles: ids });
      onSaved(data.user);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="2xl">
      <ModalHeader>
        تخصیص نقش به {user.first_name} {user.last_name}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4" data-testid="assign-roles">
          {error ? <Alert color="lighterror">{error}</Alert> : null}
          <p className="text-sm text-darklink">نقش «کاربر» همیشه اختصاص دارد. هر کاربر می‌تواند چند نقش داشته باشد.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {roles
              .filter((r) => r.name !== "user")
              .map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md border border-ld">
                  <Checkbox checked={ids.includes(r.id)} onChange={() => setIds(ids.includes(r.id) ? ids.filter((x) => x !== r.id) : [...ids, r.id])} />
                  {r.display_name}
                </label>
              ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={save} disabled={saving}>
          {saving ? <Spinner size="sm" className="me-2" /> : null}
          ذخیره نقش‌ها
        </Button>
        <Button color="lighterror" onClick={onClose}>
          انصراف
        </Button>
      </ModalFooter>
    </Modal>
  );
}
