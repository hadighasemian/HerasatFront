"use client";
import { Pagination } from "flowbite-react";
import { toPersianDigits } from "@/lib/jalali";

export default function Pager({ page, last, total, onChange }: { page: number; last: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
      <span className="text-sm text-darklink">مجموع: {toPersianDigits(total)}</span>
      {last > 1 ? (
        <div dir="ltr">
          <Pagination currentPage={page} totalPages={last} onPageChange={onChange} previousLabel="قبلی" nextLabel="بعدی" showIcons />
        </div>
      ) : null}
    </div>
  );
}
