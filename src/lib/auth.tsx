"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ensureCsrf } from "./api";
import type { Me } from "./types";

interface AuthState {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<Me | null>;
  login: (username: string, password: string, captcha?: { id: string; answer: string }) => Promise<Me>;
  logout: () => Promise<void>;
  can: (permission: string | string[]) => boolean;
  setUser: (u: Me | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: Me }>("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const onUnauth = () => setUser(null);
    window.addEventListener("herasat:unauthenticated", onUnauth);
    return () => window.removeEventListener("herasat:unauthenticated", onUnauth);
  }, [refresh]);

  const login = useCallback(async (username: string, password: string, captcha?: { id: string; answer: string }) => {
    await ensureCsrf(true);
    const { data } = await api.post<{ user: Me }>("/api/auth/login", {
      username,
      password,
      ...(captcha ? { captcha_id: captcha.id, captcha: captcha.answer } : {}),
    });
    // the session id is rotated at login, get a fresh CSRF token for it
    await ensureCsrf(true);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      await ensureCsrf(true).catch(() => undefined);
    }
  }, []);

  const can = useCallback(
    (permission: string | string[]) => {
      if (!user) return false;
      const list = Array.isArray(permission) ? permission : [permission];
      return list.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  const value = useMemo(() => ({ user, loading, refresh, login, logout, can, setUser }), [user, loading, refresh, login, logout, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
