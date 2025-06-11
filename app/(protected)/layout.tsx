import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar"; // đã sửa để nhận props
import React from "react";
import { NotificationBellWrapper } from "@/components/NotificationBellWrapper";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const notification = await NotificationBellWrapper(); // gọi server component tại đây

  return (
    <div className="w-full h-screen flex bg-gray-200">
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%]">
        <Sidebar />
      </div>

      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] flex flex-col">
        {/* Truyền chuông vào navbar */}
        <Navbar notificationSlot={notification} />
        <div className="h-full w-full p-2 overflow-y-scroll">{children}</div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
