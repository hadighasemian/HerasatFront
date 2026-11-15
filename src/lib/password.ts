export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  entropyBits: number;
}

/** Entropy-based strength estimate (character pool size × length), with simple pattern penalties. */
export function passwordStrength(pw: string): StrengthResult {
  if (!pw) return { score: 0, label: "—", color: "bg-gray-300", entropyBits: 0 };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(Math.max(pool, 1));
  if (/(.)\1{2,}/.test(pw)) bits *= 0.8;
  if (/^(?:\d+|[a-z]+|[A-Z]+)$/.test(pw)) bits *= 0.7;
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|password|admin)/i.test(pw)) bits *= 0.6;
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  const meta = [
    ["بسیار ضعیف", "bg-error"],
    ["ضعیف", "bg-warning"],
    ["متوسط", "bg-info"],
    ["قوی", "bg-success"],
    ["بسیار قوی", "bg-success"],
  ][score];
  return { score: score as StrengthResult["score"], label: meta[0], color: meta[1], entropyBits: Math.round(bits) };
}

/** Same rules as the backend StrongPassword rule (shown live in the UI). */
export function passwordPolicyChecks(pw: string, minLength = 10) {
  return [
    { ok: pw.length >= minLength, text: `حداقل ${minLength} کاراکتر` },
    { ok: /[A-Z]/.test(pw), text: "حرف بزرگ انگلیسی" },
    { ok: /[a-z]/.test(pw), text: "حرف کوچک انگلیسی" },
    { ok: /\d/.test(pw), text: "رقم" },
    { ok: /[^A-Za-z0-9\s]/.test(pw), text: "نماد (مانند !@#$%)" },
    { ok: pw.length > 0 && !/\s/.test(pw), text: "بدون فاصله" },
  ];
}

export function secureRandomInt(max: number): number {
  // rejection sampling to avoid modulo bias
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}
