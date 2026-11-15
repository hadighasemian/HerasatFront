"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Drawer, DrawerItems, Navbar, NavbarCollapse, NavbarLink } from "flowbite-react";
import { IconMenu2 } from "@tabler/icons-react";
import FullLogo from "@/app/dashboard/layout/shared/logo/FullLogo";
import { SITE_LINKS } from "./navLinks";
import { useAuth } from "@/lib/auth";

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loginHref = user ? "/dashboard" : "/auth/login";
  const loginText = user ? "داشبورد" : "ورود";

  return (
    <header className={`top-0 z-50 ${isSticky ? "bg-white dark:bg-dark shadow-md fixed w-full" : "bg-white dark:bg-dark"}`}>
      <Navbar className="fluid py-5 !px-0 container">
        <FullLogo />
        <div className="xl:hidden flex">
          <Button
            onClick={() => setIsOpen(true)}
            aria-label="منو"
            className="flex items-center justify-center text-dark dark:text-white h-10 w-10 rounded-full bg-transparent hover:bg-lightprimary"
          >
            <IconMenu2 />
          </Button>
        </div>
        <NavbarCollapse className="xl:block hidden">
          {SITE_LINKS.map((l) => (
            <NavbarLink key={l.href} as={Link} href={l.href} active={pathname === l.href} className={pathname === l.href ? "!text-primary" : ""}>
              {l.label}
            </NavbarLink>
          ))}
          <li>
            <Link href={loginHref} className="inline-block bg-primary text-white text-sm hover:bg-primaryemphasis py-2 px-5 rounded-md">
              {loginText}
            </Link>
          </li>
        </NavbarCollapse>
      </Navbar>
      <Drawer open={isOpen} onClose={() => setIsOpen(false)} position="right">
        <DrawerItems className="p-6">
          <FullLogo />
          <div className="mt-6">
            {SITE_LINKS.map((l) => (
              <Link key={l.href} className="block py-3 text-base text-ld font-semibold" href={l.href} onClick={() => setIsOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
          <Button color="primary" className="mt-2 w-full" as={Link} href={loginHref}>
            {loginText}
          </Button>
        </DrawerItems>
      </Drawer>
    </header>
  );
};

export default Header;
