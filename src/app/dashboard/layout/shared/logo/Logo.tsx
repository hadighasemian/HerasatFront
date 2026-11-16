import React from "react";
import Image from "next/image";
import Link from "next/link";
import NicicoLogo from "/public/images/logos/nicico.png";

const Logo = () => (
  <Link href="/" className="flex justify-center" aria-label="صفحه اصلی">
    <Image
      src={NicicoLogo}
      alt="حراست مجتمع مس شهربابک"
      width={210}
      height={256}
      className="h-11 w-auto"
      priority
    />
  </Link>
);

export default Logo;
