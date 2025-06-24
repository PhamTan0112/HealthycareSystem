import { Patient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { calculateAge } from "@/utils";
import { Calendar, Home, Info, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

export const PatientDetailsCard = ({ data }: { data: Patient }) => {
  return (
    <Card className="shadow-none bg-white">
      <CardHeader>
        <CardTitle>Thông tin bệnh nhân</CardTitle>

        <div className="relative size-20 xl:size-24 rounded-full overflow-hidden">
          <Image
            src={data.img || "/user.jpg"}
            alt={data?.first_name}
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {data?.first_name} {data?.last_name}
          </h2>
          <p className="text-sm text-gray-500">
            {data?.email} - {data?.phone}
          </p>
          <p className="text-sm text-gray-500">
            {data?.gender} - {calculateAge(data?.date_of_birth)} tuổi
          </p>
        </div>
      </CardHeader>
      <CardContent className="mt-4 space-y-4">
        <div className="flex items-start gap-3">
          <Calendar size={22} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Ngày sinh</p>
            <p className="text-base font-medium text-muted-foreground">
              {format(new Date(data?.date_of_birth), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Home size={22} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Địa chỉ</p>
            <p className="text-base font-medium text-muted-foreground">
              {data?.address}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail size={22} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-muted-foreground">
              {data?.email}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone size={22} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Số điện thoại</p>
            <p className="text-base font-medium text-muted-foreground">
              {data?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Info size={22} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Bác sĩ phụ trách</p>
            <p className="text-base font-medium text-muted-foreground">
              Bác sĩ Google, MBBS, FCPS
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div>
            <p className="text-sm text-gray-500">Bệnh đang điều trị</p>
            <p className="text-base font-medium text-muted-foreground">
              {data?.medical_conditions || "Không có"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div>
            <p className="text-sm text-gray-500">Dị ứng</p>
            <p className="text-base font-medium text-muted-foreground">
              {data?.allergies || "Không có"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
