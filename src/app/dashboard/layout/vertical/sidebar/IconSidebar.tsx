"use client";

import React, { useContext } from "react";
import { Icon } from "@iconify/react/offline";
import SimpleBar from "simplebar-react";
import { Button, Tooltip } from "flowbite-react";
import { CustomizerContext } from "@/app/context/customizerContext";
import Logo from "../../shared/logo/Logo";
import { useMenu } from "./useMenu";

export const IconSidebar = () => {
  const { selectedIconId, setSelectedIconId, setIsCollapse } = useContext(CustomizerContext) || {};
  const menu = useMenu();
  const active = menu.some((m) => m.id === selectedIconId) ? selectedIconId : menu[0]?.id;

  return (
    <>
      <div className="px-4 py-6 pt-7 logo">
        <Logo />
      </div>
      <SimpleBar className="miniicons">
        {menu.map((m) => (
          <Tooltip key={m.id} content={m.name} placement="left" className="flowbite-tooltip">
            <Button
              className={`h-12 w-12 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center mx-auto mb-2 ${m.id === active ? "text-primary bg-lightprimary" : "text-darklink bg-transparent"}`}
              type="button"
              aria-label={m.name}
              onClick={() => {
                setSelectedIconId(m.id);
                setIsCollapse("full-sidebar");
              }}
            >
              <Icon icon={m.icon} height={24} />
            </Button>
          </Tooltip>
        ))}
      </SimpleBar>
    </>
  );
};
