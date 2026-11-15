import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ErrorImg from "/public/images/backgrounds/errorimg.svg";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
};

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-darkgray">
      <div className="text-center">
        <Image src={ErrorImg} alt="" className="mb-4" />
        <h1 className="text-ld text-4xl mb-6">۴۰۴</h1>
        <h6 className="text-xl text-ld">صفحه‌ای که به دنبال آن هستید پیدا نشد.</h6>
        <Link href="/" className="inline-block bg-primary text-white rounded-md px-5 py-2.5 mt-6">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
