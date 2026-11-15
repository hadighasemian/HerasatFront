import React from "react";
import Image from "next/image";
import Link from "next/link";
import LogoIcon from "/public/images/logos/herasat-icon.svg";

const Logo = () => (
  <Link href="/" aria-label="صفحه اصلی">
    <Image src={LogoIcon} alt="حراست" width={40} height={40} />
  </Link>
);

export default Logo;
