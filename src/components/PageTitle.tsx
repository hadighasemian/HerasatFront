import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";

export default function PageTitle({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <CardBox className="mb-[30px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" aria-label="داشبورد" className="text-darklink hover:text-primary">
            <Icon icon="solar:home-2-line-duotone" height={20} />
          </Link>
          <span className="text-darklink">/</span>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </CardBox>
  );
}
