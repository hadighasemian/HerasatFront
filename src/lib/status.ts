import type { ReportStatus } from "./types";

export const REPORT_STATUS: Record<ReportStatus, { label: string; color: string }> = {
  submitted: { label: "در انتظار بررسی", color: "lightwarning" },
  approved: { label: "تأیید شده", color: "lightsuccess" },
  rejected: { label: "رد شده", color: "lighterror" },
};
