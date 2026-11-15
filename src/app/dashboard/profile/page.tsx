"use client";

import React, { useEffect, useState } from "react";
import { Badge, Spinner } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import PageTitle from "@/components/PageTitle";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { api, errorMessage } from "@/lib/api";
import { toJalali } from "@/lib/jalali";
import type { RoleRef } from "@/lib/types";

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

/** Read-only profile: users cannot edit their own information (only an admin can). */
export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ profile: Profile }>("/api/profile").then((r) => setP(r.data.profile)).catch((e) => setError(errorMessage(e)));
  }, []);

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
    </>
  );
}
