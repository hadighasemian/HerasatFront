"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { visibleMenu } from "./layout/vertical/sidebar/Sidebaritems";
import { isoToJalaliDate, toPersianDigits } from "@/lib/jalali";
import type { Paginated, ReportItem, TodoItem } from "@/lib/types";

export default function DashboardHome() {
  const { user, can } = useAuth();
  const [pending, setPending] = useState<number | null>(null);
  const [openTodos, setOpenTodos] = useState<TodoItem[] | null>(null);
  const [openTodoTotal, setOpenTodoTotal] = useState(0);
  const canReview = can("reports.review");
  const canTodos = can("todos.use");

  useEffect(() => {
    if (!canReview) return;
    api
      .get<Paginated<ReportItem>>("/api/reports", { params: { status: "submitted", per_page: 5 } })
      .then((r) => setPending(r.data.meta.total))
      .catch(() => undefined);
  }, [canReview]);

  useEffect(() => {
    if (!canTodos) return;
    api
      .get<Paginated<TodoItem>>("/api/todos", { params: { status: "open", per_page: 5 } })
      .then((r) => {
        setOpenTodos(r.data.data);
        setOpenTodoTotal(r.data.meta.total);
      })
      .catch(() => undefined);
  }, [canTodos]);

  const links = visibleMenu(can)
    .flatMap((m) => m.items.flatMap((g) => g.children))
    .filter((c) => c.url !== "/dashboard");

  return (
    <div className="space-y-[30px]">
      <CardBox className="bg-lightprimary dark:bg-lightprimary">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center">
            <Icon icon="solar:shield-user-line-duotone" height={30} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{user?.full_name} عزیز، خوش آمدید</h1>
            <p className="text-darklink text-sm mt-1">{user?.roles.map((r) => r.display_name || r.name).join("، ")}</p>
          </div>
        </div>
      </CardBox>

      {canTodos && openTodos !== null ? (
        <div data-testid="todo-widget">
        <CardBox>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-lightprimary text-primary flex items-center justify-center">
                <Icon icon="solar:checklist-minimalistic-line-duotone" height={26} />
              </div>
              <div>
                <h2 className="font-semibold">کارهای باز</h2>
                <p className="text-xs text-darklink">
                  {openTodoTotal ? `${toPersianDigits(openTodoTotal)} کار در انتظار انجام` : "کار بازی ندارید"}
                </p>
              </div>
            </div>
            <Link href="/dashboard/todos" className="text-sm text-primary font-medium hover:underline">
              مشاهده همه
            </Link>
          </div>
          {openTodos.length ? (
            <ul className="divide-y divide-border dark:divide-darkborder">
              {openTodos.map((t) => (
                <li key={t.id} className="py-2 flex items-center justify-between gap-3">
                  <span className="truncate">{t.title}</span>
                  {t.due_date ? <span className="text-xs text-darklink shrink-0">{isoToJalaliDate(t.due_date)}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardBox>
        </div>
      ) : null}

      {canReview && pending !== null ? (
        <Link href="/dashboard/reports?status=submitted">
          <CardBox>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-lightwarning text-warning flex items-center justify-center">
                  <Icon icon="solar:inbox-line-duotone" height={26} />
                </div>
                <span className="font-semibold">گزارش‌های در انتظار بررسی</span>
              </div>
              <span className="text-2xl font-bold text-warning">{toPersianDigits(pending)}</span>
            </div>
          </CardBox>
        </Link>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30">
        {links.map((l) => (
          <Link key={l.id} href={l.url} className="group">
            <CardBox className="h-full">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-tw bg-lightprimary text-primary flex items-center justify-center">
                  <Icon icon={l.icon || "solar:widget-line-duotone"} height={26} />
                </div>
                <span className="font-semibold group-hover:text-primary">{l.name}</span>
              </div>
            </CardBox>
          </Link>
        ))}
      </div>
    </div>
  );
}
