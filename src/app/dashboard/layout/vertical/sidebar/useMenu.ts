"use client";
import { useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { CustomizerContext } from "@/app/context/customizerContext";
import { menuIdForPath, visibleMenu } from "./Sidebaritems";

export function useMenu() {
  const { can, user } = useAuth();
  const pathname = usePathname();
  const { setSelectedIconId } = useContext(CustomizerContext) || {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const menu = useMemo(() => visibleMenu(can), [can, user]);

  useEffect(() => {
    const id = menuIdForPath(pathname, menu);
    if (id) setSelectedIconId?.(id);
  }, [pathname, menu, setSelectedIconId]);

  return menu;
}
