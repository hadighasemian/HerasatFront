import type { Metadata } from "next";
import PageHero from "@/app/components/shared/PageHero";
import TrackForm from "./TrackForm";

export const metadata: Metadata = { title: "پیگیری گزارش" };

export default function Page() {
  return (
    <>
      <PageHero title="پیگیری گزارش" subtitle="کد پیگیری دریافتی هنگام ثبت گزارش را وارد کنید." />
      <div className="container py-12">
        <TrackForm />
      </div>
    </>
  );
}
