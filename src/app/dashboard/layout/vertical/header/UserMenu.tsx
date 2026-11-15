"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/dashboard/profile", title: "پروفایل من", subtitle: "مشاهده اطلاعات حساب", icon: "solar:user-circle-line-duotone", bg: "bg-lightprimary text-primary" },
  { href: "/dashboard/change-password", title: "تغییر رمز عبور", subtitle: "امنیت حساب کاربری", icon: "solar:key-minimalistic-square-2-line-duotone", bg: "bg-lightsuccess text-success" },
];

export function Avatar({ size = 40 }: { size?: number }) {
  const { user } = useAuth();
  const initial = user?.first_name?.trim()?.[0] || "؟";
  return (
    <span
      className="rounded-full bg-primary text-white font-semibold flex items-center justify-center select-none"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

/** Shared profile dropdown (sidebar + header). */
export default function UserMenu({ trigger }: { trigger: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const doLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };
  return (
    <div className="relative group/menu">
      <Dropdown label="" className="w-screen sm:w-[360px] py-6 !shadow-lg rounded-sm" dismissOnClick={false} renderTrigger={() => <span>{trigger}</span>}>
        <div className="px-6">
          <h3 className="text-lg font-semibold text-ld">حساب کاربری</h3>
          <div className="flex items-center gap-6 pb-5 border-b dark:border-darkborder mt-5 mb-3">
            <Avatar size={64} />
            <div>
              <h5 className="card-title">{user?.full_name}</h5>
              <span className="card-subtitle block">{user?.roles.map((r) => r.display_name || r.name).join("، ")}</span>
              <p className="card-subtitle mb-0 mt-1 flex items-center" dir="ltr">
                <Icon icon="solar:user-id-line-duotone" className="text-base me-1" />
                {user?.personnel_code}
              </p>
            </div>
          </div>
        </div>
        {LINKS.map((l) => (
          <DropdownItem as={Link} href={l.href} key={l.href} className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full">
            <div className="flex items-center w-full">
              <div className={`h-11 w-11 flex-shrink-0 rounded-md flex justify-center items-center ${l.bg}`}>
                <Icon icon={l.icon} height={20} />
              </div>
              <div className="ps-4 text-start">
                <h5 className="mb-1 text-sm group-hover/link:text-primary">{l.title}</h5>
                <div className="text-xs text-darklink">{l.subtitle}</div>
              </div>
            </div>
          </DropdownItem>
        ))}
        <div className="pt-6 px-6">
          <Button color="primary" onClick={doLogout} className="w-full">
            خروج
          </Button>
        </div>
      </Dropdown>
    </div>
  );
}
