"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React from "react";
import { NotificationBell } from "./NotificationBell";

interface NavbarProps {
  notificationSlot?: React.ReactNode;
}

export const Navbar = ({ notificationSlot }: NavbarProps) => {
  const user = useAuth();

  function formatPathName(): string {
    const pathname = usePathname();
    if (!pathname) return "Overview";
    const splitRoute = pathname.split("/");
    const lastIndex = splitRoute.length - 1 > 2 ? 2 : splitRoute.length - 1;
    return splitRoute[lastIndex].replace(/-/g, " ");
  }

  return (
    <div className="p-5 flex justify-between bg-white cursor-default select-none">
      <h1 className="text-xl font-medium text-gray-500 capitalize">
        {formatPathName() || "Overview"}
      </h1>

      <div className="flex items-center gap-4">
        {notificationSlot || <NotificationBell />}
        {user?.userId && <UserButton />}
      </div>
    </div>
  );
};
