"use client";

import React from "react";
import { Sidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SideProfile from "./SideProfile/SideProfile";
import SidebarMenu from "./SidebarMenu";

const SidebarLayout = () => (
  <div className="xl:block hidden">
    <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
      <IconSidebar />
      <SideProfile />
    </div>
    <Sidebar className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray ps-4 rtl:pe-4 rtl:ps-0" aria-label="منوی داشبورد">
      <SidebarMenu className="pe-4 rtl:pe-0 rtl:ps-4" />
    </Sidebar>
  </div>
);

export default SidebarLayout;
