import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ClipboardList } from "lucide-react";
import { Table } from "@/components/tables/table";
import { format } from "date-fns";
import { LabTest } from "@prisma/client";
import { ActionDialog } from "../action-dialog";
import { UpdateLabTestDialog } from "../dialogs/update-labtest";
import { AddLabTestDialog } from "../dialogs/add-labtest";
import { getRole } from "@/utils/roles";

const columns = [
  { header: "#", key: "id", className: "hidden md:table-cell" },
  { header: "Benh nhan", key: "patient" },
  { header: "Dich vu", key: "service" },
  {
    header: "Ngay xet nghiem",
    key: "test_date",
    className: "hidden md:table-cell",
  },
  { header: "Trang thai", key: "status", className: "hidden md:table-cell" },
  { header: "Ket qua", key: "result" },
  {
    header: "Ghi chu",
    key: "notes",
    className: "max-w-xs truncate",
  },
  { header: "Thao tac", key: "action", className: "text-center" },
];

interface LabTestContainerProps {
  appointmentId?: string;
}

export default async function LabTestContainer({ appointmentId }: LabTestContainerProps) {
  const { userId } = await auth();
  const userRole = await getRole();
  const staff = await db.staff.findUnique({ where: { id: userId || "" } });

  // Kiem tra xem user co phai la patient khong
  const isPatient = userRole === "patient";

  // Neu co appointmentId, tim medical record cua cuoc hen do
  let medicalRecordId: number | undefined;
  let appointmentData: any = null;
  
  if (appointmentId) {
    // Lay thong tin cuoc hen de kiem tra quyen
    appointmentData = await db.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: {
        patient: true,
        medical: true
      }
    });

    if (appointmentData) {
      medicalRecordId = appointmentData.medical?.[0]?.id;
    }
  }

  // Tao dieu kien where cho labTests
  let whereCondition: any = {};
  
  if (medicalRecordId) {
    whereCondition.record_id = medicalRecordId;
  }
  
  // Neu la patient, chi lay xet nghiem cua chinh minh
  if (isPatient && appointmentData) {
    whereCondition.medical_record = {
      patient_id: userId
    };
  }

  const [labTests, services] = await Promise.all([
    db.labTest.findMany({
      where: whereCondition,
      orderBy: { test_date: "desc" },
      include: {
        services: true,
        medical_record: { include: { patient: true } },
      },
    }),
    db.services.findMany({ orderBy: { service_name: "asc" } }),
  ]);

  const statusColor = {
    PENDING: "bg-yellow-100 text-yellow-600",
    COMPLETED: "bg-blue-100 text-blue-600",
  };

  const statusLabel = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
  };

  const renderRow = (
    lab: LabTest & {
      services: { service_name: string };
      medical_record: {
        patient: { first_name: string; last_name: string; gender: string };
      };
    }
  ) => {
    const patient = lab.medical_record.patient;
    const isCompleted = lab.status === "COMPLETED";

    return (
      <tr
        key={lab.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="hidden md:table-cell font-medium text-blue-700 py-2">
          #{lab.id}
        </td>
        <td className="py-2">
          <div className="font-semibold uppercase">
            {patient.first_name} {patient.last_name}
          </div>
          <div className="text-xs text-gray-500">{patient.gender}</div>
        </td>
        <td className="py-2">{lab.services?.service_name}</td>
        <td className="hidden md:table-cell py-2">
          {format(new Date(lab.test_date), "dd/MM/yyyy")}
        </td>
        <td className="hidden md:table-cell py-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              statusColor[lab.status as keyof typeof statusColor]
            }`}
          >
            {statusLabel[lab.status as keyof typeof statusLabel]}
          </span>
        </td>
        <td className="py-2 max-w-[200px] truncate" title={lab.result || ""}>
          {lab.result || <span className="italic text-gray-400">Chua co</span>}
        </td>
        <td className="py-2 max-w-[200px] truncate" title={lab.notes || ""}>
          {lab.notes || <span className="italic text-gray-400">Khong co</span>}
        </td>
        <td className="text-center py-2">
          {!isPatient ? (
            !isCompleted ? (
              <div className="flex justify-center gap-2">
                <ActionDialog
                  type="delete"
                  id={lab?.id?.toString()}
                  deleteType="labtest"
                />
                <UpdateLabTestDialog labTest={lab} />
              </div>
            ) : (
              <span className="text-sm italic text-gray-400">Da hoan thanh</span>
            )
          ) : (
            <span className="text-sm italic text-gray-400">Chi xem</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 2xl:p-4">
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-xl">
            {appointmentId ? `Xet nghiem - Cuoc hen #${appointmentId}` : "Xet nghiem"}
          </h1>
          <div className="hidden lg:flex items-center gap-1">
            <ClipboardList size={20} className="text-gray-500" />
            <p className="text-2xl font-semibold">{labTests?.length}</p>
            <span className="text-gray-600 text-sm xl:text-base">
              {appointmentId ? "xet nghiem" : "tong luot"}
            </span>
          </div>
        </div>

        {!isPatient && medicalRecordId && (
          <AddLabTestDialog
            medicalId={medicalRecordId}
            services={services}
          />
        )}
      </div>

      {labTests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {appointmentId ? "Chua co xet nghiem nao cho cuoc hen nay" : "Chua co xet nghiem nao"}
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={labTests} />
      )}
    </div>
  );
}
