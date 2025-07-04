import { Diagnosis, LabTest, MedicalRecords, Patient } from "@prisma/client";
import { BriefcaseBusiness } from "lucide-react";
import React from "react";
import { Table } from "./tables/table";
import { ProfileImage } from "./profile-image";
import { formatDateTime } from "@/utils";
import { ViewAction } from "./action-options";
import { MedicalHistoryDialog } from "./medical-history-dialog";

export interface ExtendedMedicalHistory extends MedicalRecords {
  patient?: Patient;
  diagnosis: Diagnosis[];
  lab_test: LabTest[];
  index?: number;
}

interface DataProps {
  data: ExtendedMedicalHistory[];
  isShowProfile?: boolean;
}

export const MedicalHistory = ({ data, isShowProfile }: DataProps) => {
  const columns = [
    {
      header: "Bản ghi",
      key: "no",
    },
    {
      header: "Thông tin bệnh nhân",
      key: "name",
      className: isShowProfile ? "table-cell" : "hidden",
    },
    {
      header: "Ngày - Giờ",
      key: "medical_date",
      className: "",
    },
    {
      header: "Bác sĩ",
      key: "doctor",
      className: "hidden xl:table-cell",
    },
    {
      header: "Chẩn đoán",
      key: "diagnosis",
      className: "hidden md:table-cell",
    },
    {
      header: "Xét nghiệm",
      key: "lab_test",
      className: "hidden 2xl:table-cell",
    },
  ];

  const renderRow = (item: ExtendedMedicalHistory) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="py-2 xl:py-6"># {item?.id}</td>

        {isShowProfile && (
          <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
            <ProfileImage
              url={item?.patient?.img!}
              name={item?.patient?.first_name + " " + item?.patient?.last_name}
            />
            <div>
              <h3 className="font-semibold">
                {item?.patient?.first_name + " " + item?.patient?.last_name}
              </h3>
              <span className="text-xs capitalize hidden md:flex">
                {item?.patient?.gender.toLowerCase() === "male"
                  ? "nam"
                  : item?.patient?.gender.toLowerCase() === "female"
                    ? "nữ"
                    : "khác"}
              </span>
            </div>
          </td>
        )}

        <td className="">{formatDateTime(item?.created_at.toString())}</td>

        <td className="hidden items-center py-2 xl:table-cell">
          {item?.doctor_id}
        </td>

        <td className="hidden lg:table-cell">
          {item?.diagnosis?.length === 0 ? (
            <span className="text-sm italic text-gray-500">
              Không có chẩn đoán
            </span>
          ) : (
            <MedicalHistoryDialog
              id={item?.appointment_id}
              patientId={item?.patient_id}
              doctor_id={item?.doctor_id}
              label={
                <div className="flex gap-x-2 items-center text-lg">
                  {item?.diagnosis?.length}
                  <span className="text-sm">được ghi nhận</span>
                </div>
              }
            />
          )}
        </td>

        <td className="hidden 2xl:table-cell">
          {item?.lab_test?.length === 0 ? (
            <span className="text-sm italic text-gray-500">
              Không có xét nghiệm
            </span>
          ) : (
            <div className="flex gap-x-2 items-center text-lg">
              {item?.lab_test?.length}
              <span className="text-sm">được ghi nhận</span>
            </div>
          )}
        </td>

        <td>
          <ViewAction href={`/record/appointments/${item?.appointment_id}`} />
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 2xl:p-6">
      <div>
        <h1 className="font-semibold text-xl">Lịch sử khám bệnh</h1>
        <div className="hidden lg:flex items-center gap-1">
          <BriefcaseBusiness size={20} className="text-gray-500" />
          <p className="text-2xl font-semibold">{data?.length}</p>
          <span className="text-gray-600 text-sm xl:text-base">
            hồ sơ đã lưu
          </span>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};
