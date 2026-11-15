// Production server for Herasat front-end.
//
// Why a custom server: `next start` keeps any client-supplied X-Forwarded-For header and the
// /api rewrite forwards it to Laravel, which trusts 127.0.0.1 as a proxy. A client could then
// spoof its IP and dodge per-IP rate limits / lockout. Here we overwrite X-Forwarded-* with the
// real socket address unless the request comes from an explicitly trusted upstream proxy.
//
// Env: PORT (3000), HOST (0.0.0.0), TRUSTED_UPSTREAM_PROXIES (comma separated IPs, optional)
import { createServer } from "node:http";
import next from "next";

const port = parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "0.0.0.0";
const trusted = new Set(
  (process.env.TRUSTED_UPSTREAM_PROXIES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
const norm = (ip) => (ip || "").replace(/^::ffff:/, "");

const app = next({ dev: false, hostname: host, port });
const handle = app.getRequestHandler();
await app.prepare();

createServer((req, res) => {
  const remote = norm(req.socket.remoteAddress);
  if (trusted.has(remote) && req.headers["x-forwarded-for"]) {
    req.headers["x-forwarded-for"] = `${req.headers["x-forwarded-for"]}, ${remote}`;
  } else {
    req.headers["x-forwarded-for"] = remote;
    delete req.headers["x-forwarded-host"];
    delete req.headers["x-forwarded-proto"];
    delete req.headers["x-forwarded-port"];
    delete req.headers["x-real-ip"];
    delete req.headers["forwarded"];
  }
  handle(req, res);
}).listen(port, host, () => {
  console.log(`Herasat front listening on http://${host}:${port}`);
});
