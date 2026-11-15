import React from "react";
import Image from "next/image";
import Link from "next/link";
import LogoIcon from "/public/images/logos/herasat-icon.svg";

const FullLogo = () => (
  <Link href="/" className="flex items-center gap-2" aria-label="صفحه اصلی">
    <Image src={LogoIcon} alt="" width={40} height={40} />
    <span className="leading-tight">
      <span className="block text-base font-bold text-dark dark:text-white">حراست</span>
      <span className="block text-xs text-darklink">مجتمع مس شهربابک</span>
    </span>
  </Link>
);

export default FullLogo;
