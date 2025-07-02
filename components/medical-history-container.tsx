import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";
import React from "react";
import { MedicalHistory } from "./medical-history";

interface DataProps {
  id?: number | string;
  patientId: string;
}

export const MedicalHistoryContainer = async ({ id, patientId }: DataProps) => {
  const { userId } = await auth();
  const isPatient = await checkRole("PATIENT");
  
  // Nếu là bệnh nhân, chỉ cho phép xem dữ liệu của chính mình
  if (isPatient && userId !== patientId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Bạn không có quyền xem lịch sử y tế của bệnh nhân khác
      </div>
    );
  }

  const data = await db.medicalRecords.findMany({
    where: { patient_id: patientId },
    include: {
      diagnosis: { include: { doctor: true } },
      lab_test: true,
    },

    orderBy: { created_at: "desc" },
  });
  return (
    <>
      <MedicalHistory data={data} isShowProfile={false} />
    </>
  );
};
