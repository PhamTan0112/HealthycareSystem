import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { getPatientDashboardStatistics } from "@/untils/Services/patient";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

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
  console.log("o day co data nua ne: ", data);
  if (user && !data) {
    redirect("/patient/registration");
  }

  if (!data) return null;

  const cardData = [
    {
      title: "appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total appointments",
    },
    {
      title: "cancelled",
      value: appointmentCounts?.CANCELLED,
      icon: Briefcase,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Cancelled Appointments",
    },
    {
      title: "pending",
      value: appointmentCounts?.PENDING! + appointmentCounts?.SCHEDULED!,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Pending Appointments",
    },
    {
      title: "completed",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Successfully appointments",
    },
  ];

  return (
    <div className="py-6mpx-3 flex flex-col rounded-xl xl:flex-row gap-6">
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
                <Link href="/patient/self">View Profile</Link>
              </Button>
            </div>
          </div>
          <div className="w-full flex flex-wrap gap-5">
            {cardData?.map((el, id) => (
              <StatCard key={id} {...el} link="#" />
            ))}
          </div>
        </div>
      </div>
      {/* RIGHT */}
    </div>
  );
};

export default PatientDashboard;
