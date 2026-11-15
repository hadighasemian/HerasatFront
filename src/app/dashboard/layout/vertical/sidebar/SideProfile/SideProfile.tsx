"use client";
import React from "react";
import UserMenu, { Avatar } from "../../header/UserMenu";

const SideProfile = () => (
  <UserMenu
    trigger={
      <span className="h-10 w-10 mx-auto hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer">
        <Avatar size={36} />
      </span>
    }
  />
);

export default SideProfile;
