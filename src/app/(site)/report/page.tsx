import type { Metadata } from "next";
import PageHero from "@/app/components/shared/PageHero";
import ReportForm from "./ReportForm";

export const metadata: Metadata = { title: "ثبت گزارش" };

export default function Page() {
  return (
    <>
      <PageHero title="ثبت گزارش مردمی" subtitle="گزارش خود را به‌صورت محرمانه برای حراست ارسال کنید." />
      <div className="container py-12">
        <ReportForm />
      </div>
    </>
  );
}
