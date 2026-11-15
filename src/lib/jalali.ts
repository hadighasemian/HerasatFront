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
