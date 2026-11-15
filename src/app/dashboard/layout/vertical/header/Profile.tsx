"use client";
import React from "react";
import UserMenu, { Avatar } from "./UserMenu";

const Profile = () => (
  <UserMenu
    trigger={
      <span className="h-10 w-10 hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer">
        <Avatar size={35} />
      </span>
    }
  />
);

export default Profile;
