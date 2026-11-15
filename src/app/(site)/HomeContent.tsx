"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Carousel } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import CardBox from "@/app/components/shared/CardBox";
import { api } from "@/lib/api";

interface Slide {
  id: number | string;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  image_url: string | null;
}
interface Tip {
  id: number | string;
  title: string;
  body: string;
  icon: string | null;
}

const DEFAULT_SLIDES: Slide[] = [
  { id: "d1", title: "حراست مجتمع مس شهربابک", subtitle: "پاسداری از سرمایه‌های انسانی، اطلاعاتی و فیزیکی مجتمع", link_url: "/about", image_url: "/images/slides/slide-1.svg" },
  { id: "d2", title: "گزارش شما، امنیت همه", subtitle: "هرگونه تخلف یا موضوع امنیتی را به‌صورت محرمانه گزارش دهید", link_url: "/report", image_url: "/images/slides/slide-2.svg" },
  { id: "d3", title: "رمز عبور قوی بسازید", subtitle: "با ابزار تولید رمز عبور، رمزهای امن و تصادفی بسازید", link_url: "/password-generator", image_url: "/images/slides/slide-3.svg" },
];

const DEFAULT_TIPS: Tip[] = [
  { id: 1, title: "رمز عبور قوی و یکتا", body: "برای هر سامانه رمز جداگانه با حداقل ۱۰ کاراکتر شامل حروف بزرگ و کوچک، عدد و نماد انتخاب کنید.", icon: "solar:key-minimalistic-square-2-line-duotone" },
  { id: 2, title: "مراقب فیشینگ باشید", body: "روی پیوندها و پیوست‌های ناشناس کلیک نکنید و نشانی سایت را پیش از ورود اطلاعات بررسی کنید.", icon: "solar:letter-unread-line-duotone" },
  { id: 3, title: "قفل کردن رایانه", body: "هنگام ترک میز کار، صفحه را با Win + L قفل کنید.", icon: "solar:lock-keyhole-minimalistic-line-duotone" },
  { id: 4, title: "حافظه‌های جانبی", body: "از اتصال فلش و هارد ناشناس به رایانه‌های سازمان خودداری کنید.", icon: "solar:usb-line-duotone" },
  { id: 5, title: "به‌روزرسانی نرم‌افزارها", body: "سیستم‌عامل و ضدویروس را همیشه به‌روز نگه دارید.", icon: "solar:refresh-circle-line-duotone" },
  { id: 6, title: "حفاظت از اسناد", body: "اسناد طبقه‌بندی‌شده را در پیام‌رسان‌ها ارسال نکنید.", icon: "solar:document-medicine-line-duotone" },
];

const LINK_CARDS = [
  { href: "/report", title: "ثبت گزارش مردمی", text: "گزارش محرمانه تخلف یا موضوع امنیتی، بدون نیاز به ورود", icon: "solar:document-add-line-duotone", color: "bg-lightprimary text-primary" },
  { href: "/report/track", title: "پیگیری گزارش", text: "مشاهده وضعیت گزارش با کد پیگیری", icon: "solar:magnifer-line-duotone", color: "bg-lightsecondary text-secondary" },
  { href: "/password-generator", title: "تولید رمز عبور", text: "ساخت رمزهای قوی و تصادفی در مرورگر شما", icon: "solar:key-minimalistic-square-2-line-duotone", color: "bg-lightsuccess text-success" },
  { href: "/about", title: "درباره حراست", text: "آشنایی با وظایف و واحدهای حراست مجتمع", icon: "solar:shield-user-line-duotone", color: "bg-lightwarning text-warning" },
];

function isSafeLink(url: string | null): url is string {
  return !!url && (/^\/(?!\/)/.test(url) || /^https?:\/\//.test(url));
}

export default function HomeContent() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [tips, setTips] = useState<Tip[]>(DEFAULT_TIPS);

  useEffect(() => {
    api.get<{ slides: Slide[] }>("/api/public/slides").then((r) => r.data.slides?.length && setSlides(r.data.slides)).catch(() => undefined);
    api.get<{ tips: Tip[] }>("/api/public/tips").then((r) => r.data.tips?.length && setTips(r.data.tips)).catch(() => undefined);
  }, []);

  return (
    <>
      {/* Carousel */}
      <section className="container pt-8">
        <div className="h-56 sm:h-72 xl:h-[420px] rounded-[24px] overflow-hidden shadow-md" dir="ltr">
          <Carousel slideInterval={6000} pauseOnHover>
            {slides.map((s) => (
              <div key={s.id} className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image_url || "/images/slides/slide-1.svg"} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/55 to-black/10" />
                <div className="relative h-full flex flex-col justify-center items-end text-right px-8 sm:px-16" dir="rtl">
                  <h2 className="text-white text-2xl sm:text-4xl font-bold mb-3 w-full">{s.title}</h2>
                  {s.subtitle ? <p className="text-white/90 sm:text-lg max-w-xl w-full">{s.subtitle}</p> : null}
                  {isSafeLink(s.link_url) ? (
                    <div className="w-full mt-5">
                      <Link href={s.link_url} className="inline-block bg-white text-primary font-semibold rounded-md px-5 py-2 hover:bg-lightprimary">
                        بیشتر بدانید
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Link cards */}
      <section className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-30">
          {LINK_CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="group">
              <CardBox className="h-full transition-transform group-hover:-translate-y-1">
                <div className={`h-14 w-14 rounded-tw flex items-center justify-center ${c.color}`}>
                  <Icon icon={c.icon} height={30} />
                </div>
                <h3 className="text-lg font-semibold mt-4 group-hover:text-primary">{c.title}</h3>
                <p className="text-sm text-darklink">{c.text}</p>
              </CardBox>
            </Link>
          ))}
        </div>
      </section>

      {/* IT security tips */}
      <section className="bg-white dark:bg-dark py-14">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">نکات امنیت فناوری اطلاعات</h2>
            <p className="text-darklink mt-2">رعایت این نکات ساده، از اطلاعات شما و مجتمع محافظت می‌کند</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-30">
            {tips.map((t) => (
              <div key={t.id} className="flex gap-4 p-6 rounded-tw border border-ld bg-lightgray dark:bg-darkgray">
                <div className="h-12 w-12 shrink-0 rounded-full bg-lightprimary text-primary flex items-center justify-center">
                  <Icon icon={t.icon || "solar:shield-check-line-duotone"} height={26} />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{t.title}</h3>
                  <p className="text-sm text-darklink leading-7">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
