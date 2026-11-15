import type { Metadata } from "next";
import { Icon } from "@iconify/react/offline";
import PageHero from "@/app/components/shared/PageHero";
import CardBox from "@/app/components/shared/CardBox";

export const metadata: Metadata = { title: "درباره ما" };

const UNITS = [
  { title: "حفاظت پرسنلی و سلامت اقتصادی", icon: "solar:users-group-rounded-line-duotone" },
  { title: "حفاظت فیزیکی و پدافند غیرعامل", icon: "solar:shield-check-line-duotone" },
  { title: "حفاظت الکترونیک و پایش", icon: "solar:videocamera-record-line-duotone" },
  { title: "حفاظت اسناد و فناوری اطلاعات", icon: "solar:document-medicine-line-duotone" },
  { title: "حفاظت مواد ناریه و انفجاری", icon: "solar:danger-triangle-line-duotone" },
  { title: "فناوری اطلاعات و ارتباطات", icon: "solar:wi-fi-router-line-duotone" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="درباره ما" subtitle="حراست مجتمع مس شهربابک" />
      <div className="container py-12 space-y-8">
        <CardBox>
          <h2 className="text-xl font-semibold mb-3">ماموریت</h2>
          <p className="text-darklink leading-8">
            حراست مجتمع مس شهربابک با هدف صیانت از سرمایه‌های انسانی، اطلاعاتی، مالی و تأسیسات مجتمع، پیشگیری از
            تخلفات و حوادث امنیتی، و ارتقای فرهنگ امنیت در میان همکاران فعالیت می‌کند. این سامانه بستری برای ارتباط
            امن همکاران و عموم مردم با حراست، ثبت گزارش‌های مردمی و اطلاع‌رسانی نکات امنیتی است.
          </p>
        </CardBox>
        <div>
          <h2 className="text-xl font-semibold mb-5">واحدهای حراست</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30">
            {UNITS.map((u) => (
              <CardBox key={u.title}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-lightprimary text-primary flex items-center justify-center">
                    <Icon icon={u.icon} height={26} />
                  </div>
                  <h3 className="font-semibold">{u.title}</h3>
                </div>
              </CardBox>
            ))}
          </div>
        </div>
        <CardBox>
          <h2 className="text-xl font-semibold mb-3">حریم خصوصی گزارش‌دهندگان</h2>
          <p className="text-darklink leading-8">
            ثبت گزارش در این سامانه نیازی به ورود ندارد و نشانی IP یا مشخصات مرورگر گزارش‌دهنده ذخیره نمی‌شود. درج
            راه ارتباطی اختیاری است و به‌صورت رمزنگاری‌شده نگهداری می‌شود.
          </p>
        </CardBox>
      </div>
    </>
  );
}
