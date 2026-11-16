import React from "react";
import Image from "next/image";
import Link from "next/link";
import NicicoLogo from "/public/images/logos/nicico.png";

const FullLogo = () => (
  <Link href="/" className="flex items-center gap-2" aria-label="صفحه اصلی">
    <Image
      src={NicicoLogo}
      alt=""
      width={210}
      height={256}
      className="h-10 w-auto shrink-0"
      priority
    />
    <span className="leading-tight">
      <span className="block text-base font-bold text-dark dark:text-white">حراست</span>
      <span className="block text-xs text-darklink">مجتمع مس شهربابک</span>
    </span>
  </Link>
);

export default FullLogo;
