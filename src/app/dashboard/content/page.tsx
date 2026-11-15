"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Tabs, TabItem, Textarea, TextInput, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import { RequirePermission } from "@/components/AuthGuard";
import { api, errorMessage, fieldErrors } from "@/lib/api";
import { TIP_ICONS } from "@/lib/icons";
import { toPersianDigits } from "@/lib/jalali";

interface Slide {
  id: number;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
}
interface Tip {
  id: number;
  title: string;
  body: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

type Editing = { type: "slide"; item: Partial<Slide> } | { type: "tip"; item: Partial<Tip> } | null;

function ContentPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([api.get<{ slides: Slide[] }>("/api/admin/content/slides"), api.get<{ tips: Tip[] }>("/api/admin/content/tips")]);
      setSlides(s.data.slides);
      setTips(t.data.tips);
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const open = (e: Editing) => {
    setErrors({});
    setFile(null);
    setEditing(e);
  };

  const save = async () => {
    if (!editing) return;
    setErrors({});
    try {
      if (editing.type === "slide") {
        const s = editing.item;
        const fd = new FormData();
        fd.append("title", s.title || "");
        fd.append("subtitle", s.subtitle || "");
        fd.append("link_url", s.link_url || "");
        fd.append("sort_order", String(s.sort_order ?? 0));
        fd.append("is_active", s.is_active === false ? "0" : "1");
        if (file) fd.append("image", file);
        await api.post(s.id ? `/api/admin/content/slides/${s.id}` : "/api/admin/content/slides", fd);
      } else {
        const t = editing.item;
        const body = { title: t.title || "", body: t.body || "", icon: t.icon || null, sort_order: t.sort_order ?? 0, is_active: t.is_active !== false };
        if (t.id) await api.put(`/api/admin/content/tips/${t.id}`, body);
        else await api.post("/api/admin/content/tips", body);
      }
      setEditing(null);
      setFlash({ ok: true, text: "ذخیره شد." });
      load();
    } catch (e) {
      setErrors({ ...fieldErrors(e), _: errorMessage(e) });
    }
  };

  const remove = async (url: string) => {
    if (!window.confirm("حذف شود؟")) return;
    try {
      await api.delete(url);
      load();
    } catch (e) {
      setFlash({ ok: false, text: errorMessage(e) });
    }
  };

  const set = (k: string, v: unknown) => setEditing((e) => (e ? ({ ...e, item: { ...e.item, [k]: v } } as Editing) : e));
  const item = (editing?.item || {}) as Record<string, unknown>;
  const err = (k: string) => (errors[k] ? <p className="text-error text-xs mt-1">{errors[k]}</p> : null);

  return (
    <>
      <PageTitle title="محتوای سایت" />
      {flash ? (
        <Alert color={flash.ok ? "lightsuccess" : "lighterror"} className="mb-4" onDismiss={() => setFlash(null)}>
          {flash.text}
        </Alert>
      ) : null}
      <CardBox>
        <Tabs variant="underline">
          <TabItem title="اسلایدهای صفحه اصلی">
            <div className="flex justify-end mb-4">
              <Button size="sm" color="primary" onClick={() => open({ type: "slide", item: { is_active: true, sort_order: 0 } })}>
                افزودن اسلاید
              </Button>
            </div>
            {!slides.length ? <p className="text-darklink text-sm">اسلایدی ثبت نشده است؛ اسلایدهای پیش‌فرض نمایش داده می‌شوند.</p> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-30">
              {slides.map((s) => (
                <div key={s.id} className="border border-ld rounded-md overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.image_url ? <img src={s.image_url} alt="" className="h-40 w-full object-cover" /> : null}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{s.title}</h3>
                      {s.is_active ? <Badge color="lightsuccess">فعال</Badge> : <Badge color="lightgray">غیرفعال</Badge>}
                    </div>
                    <p className="text-sm text-darklink">{s.subtitle}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="xs" color="lightprimary" onClick={() => open({ type: "slide", item: s })}>
                        ویرایش
                      </Button>
                      <Button size="xs" color="lighterror" onClick={() => remove(`/api/admin/content/slides/${s.id}`)}>
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabItem>
          <TabItem title="نکات امنیتی">
            <div className="flex justify-end mb-4">
              <Button size="sm" color="primary" onClick={() => open({ type: "tip", item: { is_active: true, sort_order: 0, icon: TIP_ICONS[0] } })}>
                افزودن نکته
              </Button>
            </div>
            <div className="space-y-3">
              {tips.map((t) => (
                <div key={t.id} className="flex items-start gap-3 border border-ld rounded-md p-3">
                  <Icon icon={t.icon || "solar:shield-check-line-duotone"} height={26} className="text-primary shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{t.title}</h3>
                      {!t.is_active ? <Badge color="lightgray">غیرفعال</Badge> : null}
                      <span className="text-xs text-darklink">ترتیب: {toPersianDigits(t.sort_order)}</span>
                    </div>
                    <p className="text-sm text-darklink">{t.body}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="xs" color="lightprimary" onClick={() => open({ type: "tip", item: t })}>
                      ویرایش
                    </Button>
                    <Button size="xs" color="lighterror" onClick={() => remove(`/api/admin/content/tips/${t.id}`)}>
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabItem>
        </Tabs>
      </CardBox>

      <Modal show={!!editing} onClose={() => setEditing(null)}>
        <ModalHeader>{editing?.type === "slide" ? "اسلاید" : "نکته امنیتی"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {errors._ ? <Alert color="lighterror">{errors._}</Alert> : null}
            <div>
              <Label className="mb-2 block">عنوان</Label>
              <TextInput className="form-control" value={(item.title as string) || ""} onChange={(e) => set("title", e.target.value)} />
              {err("title")}
            </div>
            {editing?.type === "slide" ? (
              <>
                <div>
                  <Label className="mb-2 block">زیرعنوان</Label>
                  <TextInput className="form-control" value={(item.subtitle as string) || ""} onChange={(e) => set("subtitle", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">پیوند (اختیاری)</Label>
                  <TextInput dir="ltr" className="form-control" placeholder="/report" value={(item.link_url as string) || ""} onChange={(e) => set("link_url", e.target.value)} />
                  {err("link_url")}
                </div>
                <div>
                  <Label className="mb-2 block">تصویر (jpg/png/webp، حداکثر ۲ مگابایت)</Label>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
                  {err("image")}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="mb-2 block">متن</Label>
                  <Textarea rows={4} className="form-control-textarea" value={(item.body as string) || ""} onChange={(e) => set("body", e.target.value)} />
                  {err("body")}
                </div>
                <div>
                  <Label className="mb-2 block">آیکون</Label>
                  <div className="flex items-center gap-3">
                    <Icon icon={(item.icon as string) || TIP_ICONS[0]} height={28} className="text-primary" />
                    <Select className="select-md flex-1" dir="ltr" value={(item.icon as string) || ""} onChange={(e) => set("icon", e.target.value)}>
                      {TIP_ICONS.map((i) => (
                        <option key={i} value={i}>
                          {i.replace("solar:", "")}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </>
            )}
            <div>
              <Label className="mb-2 block">ترتیب نمایش</Label>
              <TextInput type="number" dir="ltr" className="form-control" value={String(item.sort_order ?? 0)} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />
            </div>
            <ToggleSwitch checked={item.is_active !== false} label="فعال" onChange={(v) => set("is_active", v)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={save}>
            ذخیره
          </Button>
          <Button color="lighterror" onClick={() => setEditing(null)}>
            انصراف
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permissions={["content.manage"]}>
      <ContentPage />
    </RequirePermission>
  );
}
