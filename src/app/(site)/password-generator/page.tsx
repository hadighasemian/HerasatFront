import type { Metadata } from "next";
import PageHero from "@/app/components/shared/PageHero";
import PasswordGenerator from "./PasswordGenerator";

export const metadata: Metadata = { title: "تولید رمز عبور" };

export default function Page() {
  return (
    <>
      <PageHero title="تولید رمز عبور امن" subtitle="رمزهای قوی و تصادفی بسازید؛ همه چیز در مرورگر شما انجام می‌شود." />
      <div className="container py-12">
        <PasswordGenerator />
      </div>
    </>
  );
}
