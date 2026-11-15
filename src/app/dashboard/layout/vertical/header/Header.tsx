"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Drawer, DrawerItems, Navbar, NavbarCollapse } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import { CustomizerContext } from "@/app/context/customizerContext";
import FullLogo from "../../shared/logo/FullLogo";
import MobileSidebar from "../sidebar/MobileSidebar";
import Profile from "./Profile";

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { setIsCollapse, isCollapse, isLayout, setActiveMode, activeMode } = useContext(CustomizerContext);

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconBtn = "h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer text-darklink dark:text-white";

  return (
    <>
      <header className={`sticky top-0 z-[5] ${isSticky ? "bg-lightgray dark:bg-dark shadow-md fixed w-full" : "bg-transparent"}`}>
        <Navbar fluid className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-30 px-4 ${isLayout == "full" ? "!max-w-full" : ""}`}>
          <button type="button" aria-label="منو" onClick={() => setIsOpen(true)} className={`${iconBtn} xl:hidden`}>
            <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
          </button>
          <NavbarCollapse className="xl:block">
            <div className="flex gap-3 items-center relative">
              <button
                type="button"
                aria-label="جمع کردن منو"
                onClick={() => setIsCollapse(isCollapse === "full-sidebar" ? "mini-sidebar" : "full-sidebar")}
                className={iconBtn}
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
              </button>
              <Link href="/" className="text-sm text-darklink hover:text-primary flex items-center gap-1">
                <Icon icon="solar:home-2-line-duotone" height={18} />
                مشاهده سایت
              </Link>
            </div>
          </NavbarCollapse>
          <div className="block xl:hidden">
            <FullLogo />
          </div>
          <div className="flex gap-3 items-center">
            <button type="button" aria-label="تغییر حالت نمایش" className={iconBtn} onClick={() => setActiveMode(activeMode === "light" ? "dark" : "light")}>
              <Icon icon={activeMode === "light" ? "solar:moon-line-duotone" : "solar:sun-bold-duotone"} width="20" />
            </button>
            <Profile />
          </div>
        </Navbar>
      </header>
      <Drawer open={isOpen} onClose={() => setIsOpen(false)} className="w-130" position="right">
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default Header;
