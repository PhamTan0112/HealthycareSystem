import { getRole } from "@/utils/roles";
import { link } from "fs";
import {
  Bell,
  CalendarDays,
  Icon,
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
  LucideIcon,
  Pill,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { LogoutButton } from "./logoutButton";
import { currentUser } from "@clerk/nextjs/server";

const ACCESS_LEVELS_ALL = [
  "admin",
  "doctor",
  "nurse",
  "lab technician",
  "patient",
];

const SidebarIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
  return <Icon className="size-6 lg:size-5" />;
};
export const Sidebar = async () => {
  const role = await getRole();
  const user = await currentUser();
  const SIDEBAR_LINKS = [
    {
      label: "MENU",
      links: [
        {
          name: "Tổng quan",
          href: "/",
          access: ACCESS_LEVELS_ALL,
          icon: LayoutDashboard,
        },
        {
          name: "Hồ sơ cá nhân",
          href: "/patient/self",
          access: ["patient"],
          icon: User,
        },
      ],
    },
    {
      label: "QUẢN LÝ",
      links: [
        {
          name: "Người dùng",
          href: "/record/users",
          access: ["admin"],
          icon: Users,
        },
        {
          name: "Bác sĩ",
          href: "/record/doctors",
          access: ["admin", "patient"],
          icon: User,
        },
        {
          name: "Nhân viên",
          href: "/record/staffs",
          access: ["admin", "doctor"],
          icon: UserRound,
        },
        {
          name: "Bệnh nhân",
          href: "/record/patients",
          access: ["admin", "doctor", "nurse"],
          icon: UsersRound,
        },
        {
          name: "Lịch hẹn",
          href: "/record/appointments",
          access: ["admin", "doctor", "nurse"],
          icon: ListOrdered,
        },
        {
          name: "Hồ sơ bệnh án",
          href: "/record/medical-records",
          access: ["admin", "doctor", "nurse"],
          icon: SquareActivity,
        },
        {
          name: "Hóa đơn",
          href: "/record/billing",
          access: ["admin", "doctor"],
          icon: Receipt,
        },
        // {
        //   name: "Quản lý bệnh nhân",
        //   href: "/nurse/patient-management",
        //   access: ["nurse"],
        //   icon: Users,
        // },
        {
          name: "Lịch hẹn",
          href: "/record/appointments",
          access: ["patient"],
          icon: ListOrdered,
        },
        {
          name: "Hồ sơ",
          href: "/patient/self",
          access: ["patient"],
          icon: List,
        },
        {
          name: "Thanh toán",
          href: "/record/billing",
          access: ["patient"],
          icon: Receipt,
        },
        {
          name: "Ngày làm việc",
          href: `/record/doctors/${user?.id}`,
          access: ["doctor"],
          icon: CalendarDays,
        },
      ],
    },
  ];

  return (
    <div className="w-full p-4 flex flex-col justify-between gap-4 bg-white overflow-scroll min-h-full ">
      <div className="">
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <div className="p-1.5 rounded-md bg-blue-600 text-white">
            <SquareActivity size={22}></SquareActivity>
          </div>
          <Link
            href="/"
            className="hidden lg:flex text-base 2xl:text-xl font-blod"
          >
            Healthycare System
          </Link>
        </div>
        <div className="mt-4 text-sm">
          {SIDEBAR_LINKS.map((el) => (
            <div key={el.label} className="flex flex-col gap-2">
              <span className="hidden uppercase lg:block text-gray-400 font-bold my-4">
                {el.label}
              </span>

              {el.links.map((link) => {
                if (link.access.includes(role.toLowerCase())) {
                  return (
                    <Link
                      href={link.href}
                      className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-blue-600/10"
                      key={link.name}
                    >
                      <SidebarIcon icon={link.icon} />
                      <span className="hidden lg:block"> {link.name}</span>
                    </Link>
                  );
                }
              })}
            </div>
          ))}
        </div>
      </div>
      <LogoutButton></LogoutButton>
    </div>
  );
};
