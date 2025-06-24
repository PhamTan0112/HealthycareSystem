import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import ChatbotPopup from "@/components/chatbot/chotbot-popu";
import { PatientRatingContainer } from "@/components/patient-rating-container";
import { StatCard } from "@/components/statCard";
import { RecentAppointments } from "@/components/tables/recent-appoinment";
import { Button } from "@/components/ui/button";
import { getPatientDashboardStatistics } from "@/utils/services/patient";
import { currentUser } from "@clerk/nextjs/server";
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
export const revalidate = 60;
const PatientDashboard = async () => {
  const user = await currentUser();

  const {
    data,
    appointmentCounts,
    lastRecords,
    totalAppointments,
    availableDoctor,
    monthlyData,
  } = await getPatientDashboardStatistics(user?.id!);
  if (user && !data) {
    redirect("/patient/registration");
  }

  if (!data) return null;

  const cardData = [
    {
      title: "Tổng cuộc hẹn",
      value: totalAppointments ?? 0,
      icon: Briefcase,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Cuộc hẹn",
    },
    {
      title: "Đã hủy",
      value: appointmentCounts?.CANCELLED ?? 0,
      icon: Briefcase,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Cuộc hẹn đã hủy",
    },
    {
      title: "Đang chờ",
      value:
        (appointmentCounts?.PENDING! ?? 0) +
        (appointmentCounts?.SCHEDULED! ?? 0),
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Cuộc hẹn đang chờ",
    },
    {
      title: "Hoàn tất",
      value: appointmentCounts?.COMPLETED ?? 0,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Cuộc hẹn hoàn tất",
    },
  ];

  return (
    <div
      style={{ caretColor: "transparent" }}
      className="py-6 px-3 flex flex-col rounded-xl xl:flex-row gap-6"
    >
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg xl:text-2xl font-semibold">
              Welcome {data?.first_name || user?.firstName}
            </h1>

            <div className="space-x-2">
              <Button size={"sm"}>{new Date().getFullYear()}</Button>
              <Button size="sm" variant="outline" className="hover:underline">
                <Link href="/patient/self">Xem hồ sơ</Link>
              </Button>
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-5">
            {cardData?.map((el, id) => <StatCard key={id} {...el} link="#" />)}
          </div>
        </div>

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData ?? []} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments data={lastRecords ?? []} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-[450px] mb-8">
          <StatSummary
            data={appointmentCounts}
            total={totalAppointments ?? 0}
          />
        </div>

        <AvailableDoctors data={availableDoctor as any} />

        <PatientRatingContainer />
        <ChatbotPopup />
      </div>
    </div>
  );
};

export default PatientDashboard;
