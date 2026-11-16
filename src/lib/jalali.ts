import moment from "jalali-moment";

/** Format an ISO date as a Jalali (Persian calendar) date/time with Persian digits. */
export function toJalali(iso?: string | null, withTime = true): string {
  if (!iso) return "—";
  const m = moment(iso);
  if (!m.isValid()) return "—";
  return toPersianDigits(m.locale("fa").format(withTime ? "YYYY/MM/DD - HH:mm" : "YYYY/MM/DD"));
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Convert an ISO date (YYYY-MM-DD or datetime) to a Jalali date like ۱۴۰۳/۰۸/۲۵. */
export function isoToJalaliDate(iso?: string | null, persianDigits = true): string {
  if (!iso) return "";
  const m = moment(iso);
  if (!m.isValid()) return "";
  const s = m.format("jYYYY/jMM/jDD");
  return persianDigits ? toPersianDigits(s) : s;
}

/** Parse a Jalali date (۱۴۰۳/۰۸/۲۵ or 1403/08/25) to an ISO YYYY-MM-DD, or null if invalid. */
export function jalaliDateToIso(value: string): string | null {
  const v = toEnglishDigits(value).trim();
  if (!v) return null;
  const m = moment(v, "jYYYY/jMM/jDD", true);
  if (!m.isValid()) return null;
  return m.format("YYYY-MM-DD");
}
