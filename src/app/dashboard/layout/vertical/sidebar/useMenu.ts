"use client";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { visibleMenu } from "./Sidebaritems";

export function useMenu() {
  const { can, user } = useAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => visibleMenu(can), [can, user]);
}
