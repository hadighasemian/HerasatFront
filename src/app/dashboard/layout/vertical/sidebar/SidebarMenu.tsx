"use client";
import React, { useContext } from "react";
import { SidebarItemGroup, SidebarItems } from "flowbite-react";
import SimpleBar from "simplebar-react";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/customizerContext";
import { useMenu } from "./useMenu";

export default function SidebarMenu({ className = "" }: { className?: string }) {
  const { selectedIconId } = useContext(CustomizerContext) || {};
  const menu = useMenu();
  const selected = menu.find((m) => m.id === selectedIconId) || menu[0];
  return (
    <SimpleBar className="h-[calc(100vh_-_85px)]">
      <SidebarItems className={className}>
        <SidebarItemGroup className="sidebar-nav hide-menu">
          {selected?.items.map((group) => (
            <React.Fragment key={group.heading}>
              <h5 className="text-link font-semibold text-sm caption">{group.heading}</h5>
              {group.children.map((child) => (
                <React.Fragment key={child.id}>{child.children ? <NavCollapse item={child} /> : <NavItems item={child} />}</React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </SidebarItemGroup>
      </SidebarItems>
    </SimpleBar>
  );
}
