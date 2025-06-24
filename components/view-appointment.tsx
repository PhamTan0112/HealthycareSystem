import React from "react";
import { NumberDomain } from "recharts/types/util/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { calculateAge, formatDateTime } from "@/utils";
import { ProfileImage } from "./profile-image";
import { Calendar, Phone } from "lucide-react";
import { format } from "date-fns";
import { AppointmentStatusIndicator } from "./appointment-status-indicator";
import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { AppointmentAction } from "./appointment-action";
import { getAppointmentById } from "@/utils/services/appointment";

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
  const { data } = await getAppointmentById(Number(id!));
  const { userId } = await auth();

  if (!data) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full bg-blue-500/10 hover:underline text-blue-600 px-1.5 py-1 text-xs md:text-sm"
        >
          Xem
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[425px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-8 overflow-y-auto">
        <>
          <DialogHeader>
            <DialogTitle>Chi tiết cuộc hẹn</DialogTitle>
            <DialogDescription>
              Cuộc hẹn được đặt vào ngày{" "}
              {formatDateTime(data?.created_at.toString())}
            </DialogDescription>
          </DialogHeader>

          {data?.status === "CANCELLED" && (
            <div className="bg-yellow-100 p-4 mt-4 rounded-md">
              <span className="font-semibold text-sm">
                Cuộc hẹn này đã bị hủy
              </span>
              <p className="text-sm">
                <strong>Lý do</strong>: {data?.reason}
              </p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <p className="w-fit bg-blue-100 text-blue-600 py-1 rounded text-xs md:text-sm">
              Thông tin cá nhân
            </p>

            <div className="flex flex-col md:flex-row gap-6 mb-16">
              <div className="flex gap-1 w-full md:w-1/2">
                <ProfileImage
                  url={data?.patient?.img!}
                  name={
                    data?.patient?.first_name + " " + data?.patient?.last_name
                  }
                  className="size-20 bg-blue-500"
                  textClassName="text-2xl"
                />

                <div className="space-y-0.5">
                  <h2 className="text-lg md:text-xl font-semibold uppercase">
                    {data?.patient?.first_name + " " + data?.patient?.last_name}
                  </h2>

                  <p className="flex items-center gap-2 text-gray-600">
                    <Calendar size={20} className="text-gray-500" />
                    {calculateAge(data?.patient?.date_of_birth)} tuổi
                  </p>

                  <span className="flex items-center text-sm gap-2">
                    <Phone size={16} className="text-gray-500" />
                    {data?.patient?.phone}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Địa chỉ</span>
                <p className="text-gray-600 capitalize">
                  {data?.patient?.address}
                </p>
              </div>
            </div>

            <p className="w-fit bg-blue-100 text-blue-600 py-1 rounded text-xs md:text-sm">
              Thông tin cuộc hẹn
            </p>

            <div className="grid grid-cols-3 gap-10">
              <div>
                <span className="text-sm text-gray-500">Ngày</span>
                <p className="text-sm text-gray-600">
                  {format(data?.appointment_date, "dd/MM/yyyy")}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Thời gian</span>
                <p>{data?.time}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Trạng thái</span>
                <AppointmentStatusIndicator status={data?.status} />
              </div>
            </div>

            {data?.note && (
              <div>
                <span className="text-sm text-gray-500">
                  Ghi chú từ bệnh nhân
                </span>
                <p>{data?.note}</p>
              </div>
            )}

            <p className="w-fit bg-blue-100 text-blue-600 py-1 px-2 rounded text-xs md:text-sm mt-16">
              Thông tin bác sĩ
            </p>
            <div className="w-full flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex gap-3">
                <ProfileImage
                  url={data?.doctor?.img!}
                  name={data?.doctor?.name}
                  className="xl:size-20 bg-emerald-600"
                  textClassName="xl:text-2xl"
                />
                <div className="">
                  <h2 className="text-lg uppercase font-medium">
                    {data?.doctor?.name}
                  </h2>
                  <p className="flex items-center gap-2 text-gray-600 capitalize">
                    {data?.doctor?.specialization}
                  </p>
                </div>
              </div>
            </div>

            {((await checkRole("ADMIN")) || data?.doctor_id === userId) && (
              <>
                <p className="w-fit bg-blue-100 text-blue-600 py-1 px-2 rounded text-xs md:text-sm mt-4">
                  Thao tác quản lý
                </p>
                <AppointmentAction id={data.id} status={data?.status} />
              </>
            )}
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};
