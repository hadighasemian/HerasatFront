"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useAuth } from "@/lib/auth";

const CHANGE_PW = "/dashboard/change-password";

/**
 * Client-side gate for the dashboard (UX only – the API enforces authentication and
 * permissions on every request). Redirects to login when there is no session and forces
 * the change-password page while the default password is still in use.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    } else if (user.must_change_password && pathname !== CHANGE_PW) {
      router.replace(CHANGE_PW);
    }
  }, [loading, user, pathname, router]);

  useEffect(() => {
    const onForce = () => refresh();
    window.addEventListener("herasat:password-change-required", onForce);
    return () => window.removeEventListener("herasat:password-change-required", onForce);
  }, [refresh]);

  if (loading || !user || (user.must_change_password && pathname !== CHANGE_PW)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }
  return <>{children}</>;
}

/** Shows children only when the user has one of the permissions; otherwise a 403 notice. */
export function RequirePermission({ permissions, children }: { permissions: string[]; children: React.ReactNode }) {
  const { can } = useAuth();
  if (!can(permissions)) {
    return (
      <div className="rounded-tw bg-white dark:bg-darkgray p-10 text-center">
        <h2 className="text-xl font-semibold mb-2">دسترسی غیرمجاز</h2>
        <p className="text-darklink">شما به این بخش دسترسی ندارید.</p>
      </div>
    );
  }
  return <>{children}</>;
}
