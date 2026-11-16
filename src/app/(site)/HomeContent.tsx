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

const DEFAULT_BANNER = "/images/slides/banner.webp";
const DEFAULT_BANNER_SRCSET = "/images/slides/banner.webp 1920w, /images/slides/banner@2x.webp 3840w";

const DEFAULT_SLIDES: Slide[] = [
  { id: "d1", title: "شعار سال ۱۴۰۵", subtitle: null, link_url: null, image_url: DEFAULT_BANNER },
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

function SlideImage({ slide }: { slide: Slide }) {
  const src = slide.image_url || DEFAULT_BANNER;
  const isDefaultBanner = src.includes("/images/slides/banner");
  return (
    <div className="relative h-full w-full" data-testid="carousel-item">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={isDefaultBanner ? DEFAULT_BANNER_SRCSET : undefined}
        sizes={isDefaultBanner ? "(min-width: 1280px) 1152px, 100vw" : undefined}
        alt={slide.title || ""}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
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
      {/* Banner / carousel: image only — title is the img alt, no text overlay. */}
      <section className="container pt-8">
        <div className="aspect-[1920/900] w-full rounded-[24px] overflow-hidden shadow-md" dir="ltr">
          {slides.length <= 1 ? (
            <SlideImage slide={slides[0] || DEFAULT_SLIDES[0]} />
          ) : (
            <Carousel slideInterval={6000} pauseOnHover>
              {slides.map((s) => (
                <SlideImage key={s.id} slide={s} />
              ))}
            </Carousel>
          )}
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
