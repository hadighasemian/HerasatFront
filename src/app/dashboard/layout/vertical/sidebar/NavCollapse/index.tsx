"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { SidebarCollapse, SidebarItemGroup } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import { HiOutlineChevronDown } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { ChildItem } from "../Sidebaritems";
import NavItems from "../NavItems";

const NavCollapse: React.FC<{ item: ChildItem }> = ({ item }) => {
  const pathname = usePathname();
  const activeDD = item.children?.some((t) => t.url === pathname);
  return (
    <SidebarCollapse
      label={item.name}
      open={!!activeDD}
      icon={() => <Icon icon={item.icon || "solar:folder-line-duotone"} height={18} />}
      className={activeDD ? "!text-primary bg-lightprimary" : ""}
      renderChevronIcon={(theme, open) => <HiOutlineChevronDown aria-hidden className={twMerge(theme.label.icon.open[open ? "on" : "off"])} />}
    >
      <SidebarItemGroup className="sidebar-dropdown">
        {item.children?.map((child) => (
          <React.Fragment key={child.id}>{child.children ? <NavCollapse item={child} /> : <NavItems item={child} />}</React.Fragment>
        ))}
      </SidebarItemGroup>
    </SidebarCollapse>
  );
};

export default NavCollapse;
