"use client";
import React from "react";
import { Sidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SideProfile from "./SideProfile/SideProfile";
import SidebarMenu from "./SidebarMenu";

const MobileSidebar = () => (
  <div>
    <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
      <IconSidebar />
      <SideProfile />
    </div>
    <Sidebar className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray transition-all" aria-label="منوی داشبورد">
      <SidebarMenu className="ps-4 pe-4" />
    </Sidebar>
  </div>
);

export default MobileSidebar;
