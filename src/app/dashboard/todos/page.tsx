"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, TextInput, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import Pager from "@/components/Pager";
import { RequirePermission } from "@/components/AuthGuard";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { isoToJalaliDate, jalaliDateToIso, toJalali } from "@/lib/jalali";
import type { Paginated, TodoItem } from "@/lib/types";

type StatusFilter = "all" | "open" | "done";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "open", label: "باز" },
  { id: "done", label: "انجام‌شده" },
];

function isOverdue(t: TodoItem): boolean {
  if (t.is_done || !t.due_date) return false;
  return t.due_date < new Date().toISOString().slice(0, 10);
}

function TodosPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<TodoItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<TodoItem | null | "new">(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueJalali, setDueJalali] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Paginated<TodoItem>>("/api/todos", { params: { status, page, per_page: 10 } });
      setData(data);
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  const openForm = (item: TodoItem | "new") => {
    setFormErrors({});
    if (item === "new") {
      setTitle("");
      setNotes("");
      setDueJalali("");
    } else {
      setTitle(item.title);
      setNotes(item.notes || "");
      setDueJalali(item.due_date ? isoToJalaliDate(item.due_date, false) : "");
    }
    setEditing(item);
  };

  const save = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      let due: string | null = null;
      if (dueJalali.trim()) {
        due = jalaliDateToIso(dueJalali);
        if (!due) {
          setFormErrors({ due_date: "تاریخ را به صورت ۱۴۰۳/۰۸/۲۵ وارد کنید." });
          setSaving(false);
          return;
        }
      }
      const payload = { title: title.trim(), notes: notes.trim() || null, due_date: due };
      if (editing === "new") {
        await api.post("/api/todos", payload);
        setFlash({ ok: true, text: "کار جدید ثبت شد." });
      } else if (editing) {
        await api.put(`/api/todos/${editing.id}`, payload);
        setFlash({ ok: true, text: "کار به‌روز شد." });
      }
      setEditing(null);
      load();
    } catch (e) {
      const fe = fieldErrors(e);
      setFormErrors(fe);
      if (!Object.keys(fe).length) setFlash({ ok: false, text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async (t: TodoItem) => {
    try {
      await api.put(`/api/todos/${t.id}`, { is_done: !t.is_done });
      load();
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  };

  const remove = async (t: TodoItem) => {
    if (!window.confirm(`کار «${t.title}» حذف شود؟`)) return;
    try {
      await api.delete(`/api/todos/${t.id}`);
      setFlash({ ok: true, text: "کار حذف شد." });
      load();
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  };

  return (
    <>
      <PageTitle
        title="کارهای من"
        actions={
          <Button color="primary" size="sm" onClick={() => openForm("new")}>
            <Icon icon="solar:add-circle-line-duotone" height={18} className="me-1" />
            کار جدید
          </Button>
        }
      />
      <CardBox>
        <div className="flex flex-wrap items-center gap-2 mb-5" data-testid="todo-filters">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              color={status === f.id ? "primary" : "lightprimary"}
              onClick={() => {
                setStatus(f.id);
                setPage(1);
              }}
            >
              {f.label}
            </Button>
          ))}
          {loading ? <Spinner className="ms-2" size="sm" /> : null}
        </div>
        {flash ? (
          <Alert color={flash.ok ? "success" : "failure"} className="mb-4" onDismiss={() => setFlash(null)}>
            {flash.text}
          </Alert>
        ) : null}
        <ul className="divide-y divide-border dark:divide-darkborder" data-testid="todo-list">
          {data?.data.map((t) => (
            <li key={t.id} className="py-4 flex items-start gap-3" data-testid="todo-item">
              <Checkbox className="mt-1" checked={t.is_done} onChange={() => toggleDone(t)} aria-label="انجام شد" />
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${t.is_done ? "line-through text-darklink" : ""}`}>{t.title}</div>
                {t.notes ? <p className="text-sm text-darklink mt-1 whitespace-pre-wrap">{t.notes}</p> : null}
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  {t.due_date ? (
                    <Badge color={isOverdue(t) ? "failure" : "lightprimary"}>
                      <span className="inline-flex items-center gap-1">
                        <Icon icon="solar:calendar-line-duotone" height={14} />
                        سررسید: {isoToJalaliDate(t.due_date)}
                        {isOverdue(t) ? " (گذشته)" : ""}
                      </span>
                    </Badge>
                  ) : null}
                  {t.is_done ? <Badge color="success">انجام‌شده {t.completed_at ? toJalali(t.completed_at) : ""}</Badge> : null}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button color="lightprimary" size="xs" onClick={() => openForm(t)} aria-label="ویرایش">
                  <Icon icon="solar:pen-line-duotone" height={16} />
                </Button>
                <Button color="light" size="xs" onClick={() => remove(t)} aria-label="حذف">
                  <Icon icon="solar:trash-bin-trash-line-duotone" height={16} />
                </Button>
              </div>
            </li>
          ))}
          {data && !data.data.length ? <li className="py-10 text-center text-darklink">کاری در این فهرست نیست.</li> : null}
        </ul>
        {data ? <Pager page={data.meta.current_page} last={data.meta.last_page} total={data.meta.total} onChange={setPage} /> : null}
      </CardBox>

      <Modal show={editing !== null} onClose={() => setEditing(null)} dir="rtl">
        <ModalHeader>{editing === "new" ? "کار جدید" : "ویرایش کار"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="todo-title" className="mb-2 block">
                عنوان
              </Label>
              <TextInput id="todo-title" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              {formErrors.title ? <p className="text-error text-xs mt-1">{formErrors.title}</p> : null}
            </div>
            <div>
              <Label htmlFor="todo-notes" className="mb-2 block">
                توضیحات
              </Label>
              <Textarea id="todo-notes" className="form-control" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              {formErrors.notes ? <p className="text-error text-xs mt-1">{formErrors.notes}</p> : null}
            </div>
            <div>
              <Label htmlFor="todo-due" className="mb-2 block">
                سررسید (اختیاری، شمسی)
              </Label>
              <TextInput
                id="todo-due"
                className="form-control"
                dir="ltr"
                placeholder="1403/08/25"
                value={dueJalali}
                onChange={(e) => setDueJalali(e.target.value)}
              />
              {formErrors.due_date ? <p className="text-error text-xs mt-1">{formErrors.due_date}</p> : null}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={save} disabled={saving || !title.trim()}>
            {saving ? <Spinner size="sm" className="me-2" /> : null}
            ذخیره
          </Button>
          <Button color="light" onClick={() => setEditing(null)}>
            انصراف
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={["todos.use"]}>
      <TodosPage />
    </RequirePermission>
  );
}
