"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarItem } from "flowbite-react";
import { Icon } from "@iconify/react/offline";
import { ChildItem } from "../Sidebaritems";

const NavItems: React.FC<{ item: ChildItem }> = ({ item }) => {
  const pathname = usePathname();
  const active = item.url === "/dashboard" ? pathname === item.url : pathname === item.url || pathname.startsWith(item.url + "/");
  return (
    <SidebarItem href={item.url} as={Link} className={active ? "!text-primary bg-lightprimary" : "text-link bg-transparent group/link"}>
      <span className="flex gap-3 align-center items-center">
        {item.icon ? (
          <Icon icon={item.icon} className={item.color} height={18} />
        ) : (
          <span className={`h-[6px] w-[6px] rounded-full mx-1.5 ${active ? "!bg-primary" : "bg-darklink dark:bg-white group-hover/link:bg-primary"}`} />
        )}
        <span className="max-w-36 overflow-hidden">{item.name}</span>
      </span>
    </SidebarItem>
  );
};

export default NavItems;
