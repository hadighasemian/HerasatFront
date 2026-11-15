import Link from "next/link";
import React from "react";
import Logo from "@/app/dashboard/layout/shared/logo/Logo";
import { SITE_LINKS } from "../header/navLinks";

const Footer = () => {
  const year = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());
  return (
    <footer className="bg-white dark:bg-dark border-t border-ld mt-auto">
      <div className="container">
        <div className="pt-12 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
            {SITE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-darklink hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-darklink text-sm">
            تمامی حقوق برای حراست مجتمع مس شهربابک محفوظ است © {year}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
