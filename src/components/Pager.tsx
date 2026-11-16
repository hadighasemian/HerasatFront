"use client";
import { Pagination } from "flowbite-react";
import { toPersianDigits } from "@/lib/jalali";

export default function Pager({ page, last, total, onChange }: { page: number; last: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
      <span className="text-sm text-darklink">مجموع: {toPersianDigits(total)}</span>
      {last > 1 ? (
        <>
          {/* full page list on wider screens */}
          <div dir="ltr" className="hidden sm:block max-w-full overflow-x-auto">
            <Pagination currentPage={page} totalPages={last} onPageChange={onChange} previousLabel="قبلی" nextLabel="بعدی" showIcons />
          </div>
          {/* phones: prev/next only, so the pager never widens the page */}
          <div className="flex sm:hidden items-center gap-2 text-sm" data-testid="pager-compact">
            <button
              type="button"
              className="rounded-md border border-ld px-3 py-1.5 hover:bg-lightprimary hover:text-primary disabled:opacity-50 disabled:pointer-events-none"
              disabled={page <= 1}
              onClick={() => onChange(page - 1)}
            >
              قبلی
            </button>
            <span className="text-darklink whitespace-nowrap">
              {toPersianDigits(page)} از {toPersianDigits(last)}
            </span>
            <button
              type="button"
              className="rounded-md border border-ld px-3 py-1.5 hover:bg-lightprimary hover:text-primary disabled:opacity-50 disabled:pointer-events-none"
              disabled={page >= last}
              onClick={() => onChange(page + 1)}
            >
              بعدی
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
