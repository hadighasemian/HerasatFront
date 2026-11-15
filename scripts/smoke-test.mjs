#!/usr/bin/env node
// Smoke test against a running front-end (npm start) + back-end.
// Usage: BASE=http://localhost:3000 npm run smoke
const BASE = process.env.BASE || "http://localhost:3000";
let failed = 0;
const check = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) failed++;
};

for (const path of ["/", "/about", "/password-generator", "/report", "/report/track", "/auth/login"]) {
  const r = await fetch(BASE + path);
  const html = await r.text();
  check(r.status === 200 && html.includes('dir="rtl"'), `GET ${path} 200 (rtl)`);
  if (path === "/") {
    const csp = r.headers.get("content-security-policy") || "";
    check(/script-src[^;]*'nonce-/.test(csp), "CSP with nonce");
    check(csp.includes("frame-ancestors 'none'"), "CSP frame-ancestors none");
    check(r.headers.get("x-frame-options") === "DENY", "X-Frame-Options DENY");
    check(r.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options nosniff");
    check(!!r.headers.get("referrer-policy"), "Referrer-Policy");
    check(!r.headers.get("x-powered-by"), "no X-Powered-By");
  }
}

const dash = await fetch(BASE + "/dashboard", { redirect: "manual" });
check(dash.status >= 300 && dash.status < 400 && (dash.headers.get("location") || "").includes("/auth/login"), "/dashboard redirects to login without session");

const tips = await fetch(BASE + "/api/public/tips", { headers: { Accept: "application/json" } });
check(tips.status === 200 && Array.isArray((await tips.json()).tips), "API proxy /api/public/tips");

const csrf = await fetch(BASE + "/sanctum/csrf-cookie");
check(csrf.status === 204 && csrf.headers.getSetCookie().some((c) => c.startsWith("XSRF-TOKEN=")), "CSRF cookie endpoint");

const me = await fetch(BASE + "/api/auth/me", { headers: { Accept: "application/json" } });
check(me.status === 401, "/api/auth/me is 401 without session");

const reg = await fetch(BASE + "/api/auth/register", { method: "POST", headers: { Accept: "application/json" } });
check(reg.status === 404 || reg.status === 405 || reg.status === 419, "no register endpoint");

console.log(failed ? `\n${failed} check(s) failed` : "\nall smoke checks passed");
process.exit(failed ? 1 : 0);
