import { getAdminDashboardStats } from "@/utils/services/admin";
import React from "react";
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/statCard";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { RecentAppointments } from "@/components/tables/recent-appoinment";
import { StatSummary } from "@/components/charts/stat-summary";
import { AvailableDoctors } from "@/components/available-doctor";
const AdminDashboard = async () => {
  const {
    availableDoctors,
    last5Records,
    appointmentCounts,
    monthlyData,
    totalDoctors,
    totalPatient,
    totalAppointments,
  } = await getAdminDashboardStats();
  const cardData = [
    {
      title: "Bệnh nhân",
      value: totalPatient,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Tổng số bệnh nhân",
      link: "/manage-patients",
    },
    {
      title: "Bác sĩ",
      value: totalDoctors,
      icon: User,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Tổng số bác sĩ",
      link: "/manage-doctors",
    },
    {
      title: "Cuộc hẹn",
      value: totalAppointments,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Tổng số cuộc hẹn",
      link: "/manage-appointments",
    },
    {
      title: "Tư vấn",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Tổng số buổi tư vấn",
      link: "/manage-appointments",
    },
  ];

  return (
    <div className="py-6 px-3 flex flex-col xl:flex-row rounded-xl gap-6 cursor-default select-none">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Thống kê</h1>
            <Button size={"sm"} variant={"outline"}>
              {new Date().getFullYear()}
            </Button>
          </div>

          <div className="w-full  flex flex-wrap gap-5">
            {cardData?.map((el, index) => (
              <StatCard
                key={index}
                title={el.title}
                value={el.value!}
                icon={el.icon}
                className={el.className}
                iconClassName={el.iconClassName}
                note={el.note}
                link={el.link}
              />
            ))}
          </div>
        </div>

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData!} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments data={last5Records!} />
        </div>
      </div>

      {/* RIGHT */}

      <div className="w-full xl:w-[30%]">
        <div className="w-full h-[450px]">
          <StatSummary data={appointmentCounts} total={totalAppointments!} />
        </div>

        <AvailableDoctors data={availableDoctors as any} />
      </div>
    </div>
  );
};

export default AdminDashboard;
