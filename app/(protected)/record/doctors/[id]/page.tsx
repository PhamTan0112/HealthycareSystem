import { availableDays } from "@/components/available-doctor";
import { DoctorWorkingDaysForm } from "@/components/forms/update-doctor-form";
import { ProfileImage } from "@/components/profile-image";
import { RatingContainer } from "@/components/rating-container";
import { RecentAppointments } from "@/components/tables/recent-appoinment";
import { getDoctorById } from "@/utils/services/doctor";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

import { BsCalendarDateFill, BsPersonWorkspace } from "react-icons/bs";
import { FaBriefcaseMedical, FaCalendarDays } from "react-icons/fa6";
import { IoTimeSharp } from "react-icons/io5";
import { MdEmail, MdLocalPhone } from "react-icons/md";

const DoctorProfile = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { data, totalAppointment } = await getDoctorById(params?.id);

  if (!data) return null;

  return (
    <div className="bg-gray-100/60 h-full rounded-xl py-6 px-3 2xl:px-5 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-[70%]">
        <div className="bg-white rounded-e-xl p-4 flex flex-col gap-4">
          <div className="bg-blue-50 py-6 px-4 rounded-md flex gap-4 flex-1">
            <ProfileImage
              url={data?.img!}
              name={data?.name}
              className="size-20"
              bgColor={data?.colorCode!}
              textClassName="text-4xl text-black"
            />

            <div className="w-2/3 flex flex-col justify-between gap-x-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold uppercase">
                  {data?.name}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                {data?.address || "Chưa có thông tin địa chỉ"}
              </p>

              <div className="mt-4 flex items-center justify-between gap-2 flex-wrap text-sm font-medium">
                <div className="w-full flex text-base">
                  <span>Số giấy phép:</span>
                  <p className="font-semibold">{data?.license_number}</p>
                </div>

                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <FaBriefcaseMedical className="text-lg" />
                  <span className="capitalize">{data?.specialization}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <BsPersonWorkspace className="text-lg" />
                  <span className="capitalize">{data?.type}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <MdEmail className="text-lg" />
                  <span className="capitalize">{data?.email}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <MdLocalPhone className="text-lg" />
                  <span className="capitalize">{data?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 py-6 px-4 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="doctorCard flex items-center gap-4 bg-white shadow-sm p-4 rounded-lg h-full">
              <FaBriefcaseMedical className="text-blue-500 text-2xl" />
              <div>
                <h1 className="text-xl font-semibold">{totalAppointment}</h1>
                <span className="text-sm text-gray-500">Số lượt khám</span>
              </div>
            </div>
            <div className="doctorCard flex items-center gap-4 bg-white shadow-sm p-4 rounded-lg h-full">
              <FaCalendarDays className="text-blue-500 text-2xl" />
              <div>
                <h1 className="text-xl font-semibold">
                  {data?.working_days?.length}
                </h1>
                <span className="text-sm text-gray-500">Số ngày làm việc</span>
              </div>
            </div>
            <div className="doctorCard flex items-center gap-4 bg-white shadow-sm p-4 rounded-lg h-full">
              <IoTimeSharp className="text-blue-500 text-2xl" />
              <div>
                <h1 className="text-xl font-semibold">
                  {availableDays({ data: data.working_days })}
                </h1>
                <span className="text-sm text-gray-500">Giờ làm việc</span>
              </div>
            </div>
            <div className="doctorCard flex items-center gap-4 bg-white shadow-sm p-4 rounded-lg h-full">
              <BsCalendarDateFill className="text-blue-500 text-2xl" />
              <div>
                <h1 className="text-xl font-semibold">
                  {format(data?.created_at, "yyyy-MM-dd")}
                </h1>
                <span className="text-sm text-gray-500">Ngày bắt đầu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-e-xl p-4 mt-6">
          <RecentAppointments data={data?.appointments} />
        </div>
      </div>

      <div className="w-full lg:w-[30%] flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Truy cập nhanh</h1>

          <div className="mt-8 flex gap-4 flex-wrap text-sm text-gray-500">
            <Link
              href={`/record/appointments?id=${data?.id}`}
              className="p-3 rounded-md bg-yellow-60 hover:underline"
            >
              Lịch hẹn của bác sĩ
            </Link>

            <Link
              href="#"
              className="p-3 rounded-md bg-purple-50 hover:underline"
            >
              Gửi yêu cầu nghỉ phép
            </Link>
          </div>
        </div>
        <DoctorWorkingDaysForm
          doctorId={data.id}
          initialSchedule={data.working_days}
        />
        <RatingContainer id={params?.id} />
      </div>
    </div>
  );
};

export default DoctorProfile;
