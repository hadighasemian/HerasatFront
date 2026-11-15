import axios, { AxiosError } from "axios";

/**
 * Axios instance for the Laravel API.
 *
 * Security model (Laravel Sanctum SPA authentication):
 * - The browser only talks to the Next.js origin; Next.js proxies /api/* and /sanctum/* to Laravel
 *   (see next.config.mjs rewrites), so cookies are first-party and no CORS is involved.
 * - Auth uses Laravel's HttpOnly, SameSite=Strict, encrypted session cookie. No token is stored in
 *   localStorage/sessionStorage, so XSS cannot steal a credential.
 * - State-changing requests carry the X-XSRF-TOKEN header (read from the XSRF-TOKEN cookie) for CSRF protection.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 60000,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

let csrfPromise: Promise<unknown> | null = null;

/** Fetch the CSRF cookie once (and again after a 419). */
export function ensureCsrf(force = false): Promise<unknown> {
  if (force || !csrfPromise) {
    csrfPromise = api.get("/sanctum/csrf-cookie").catch((e) => {
      csrfPromise = null;
      throw e;
    });
  }
  return csrfPromise;
}

// Ensure CSRF cookie before mutating requests; retry once on CSRF mismatch (419).
api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method) && !config.url?.includes("/sanctum/csrf-cookie")) {
    await ensureCsrf();
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError & { config?: { _retried?: boolean } }) => {
    const cfg = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (error.response?.status === 419 && cfg && !cfg._retried) {
      cfg._retried = true;
      await ensureCsrf(true);
      return api.request(cfg);
    }
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("herasat:unauthenticated"));
    }
    if (
      error.response?.status === 403 &&
      (error.response.data as { code?: string })?.code === "password_change_required" &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new CustomEvent("herasat:password-change-required"));
    }
    return Promise.reject(error);
  }
);

export type ApiError = { message: string; errors?: Record<string, string[]>; code?: string; captcha_required?: boolean };

/** Human readable Persian error message from an API error. */
export function errorMessage(e: unknown, fallback = "خطایی رخ داد. لطفاً دوباره تلاش کنید."): string {
  const err = e as AxiosError<ApiError>;
  if (!err?.response) return "ارتباط با سرور برقرار نشد.";
  const data = err.response.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.length) return first[0];
  }
  return data?.message || fallback;
}

export function fieldErrors(e: unknown): Record<string, string> {
  const err = e as AxiosError<ApiError>;
  const out: Record<string, string> = {};
  Object.entries(err?.response?.data?.errors || {}).forEach(([k, v]) => {
    out[k] = v[0];
  });
  return out;
}
