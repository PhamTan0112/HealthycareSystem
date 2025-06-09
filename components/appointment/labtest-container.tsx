import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ClipboardList } from "lucide-react";
import { Table } from "@/components/tables/table";
import { format } from "date-fns";
import { LabTest } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { UpdateLabTestDialog } from "../dialogs/update-labtest";

const columns = [
  {
    header: "#",
    key: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Patient",
    key: "patient",
  },
  {
    header: "Service",
    key: "service",
  },
  {
    header: "Test Date",
    key: "test_date",
    className: "hidden md:table-cell",
  },
  {
    header: "Status",
    key: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Result",
    key: "result",
  },
  {
    header: "Action",
    key: "action",
    className: "text-center",
  },
];

export default async function LabTestContainer() {
  const { userId } = await auth();
  const staff = await db.staff.findUnique({ where: { id: userId || "" } });
  const isTech = staff?.role === "LAB_TECHNICIAN";

  const labTests = await db.labTest.findMany({
    orderBy: { test_date: "desc" },
    include: {
      services: true,
      medical_record: {
        include: { patient: true },
      },
    },
  });

  const statusColor = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
  };

  const renderRow = (
    lab: LabTest & {
      services: { service_name: string };
      medical_record: {
        patient: {
          first_name: string;
          last_name: string;
          gender: string;
        };
      };
    }
  ) => {
    const patient = lab.medical_record.patient;

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
            {lab.status}
          </span>
        </td>
        <td className="py-2 max-w-[200px] truncate">
          {lab.result || <span className="italic text-gray-400">N/A</span>}
        </td>
        <td className="text-center py-2">
          <UpdateLabTestDialog labTest={lab} />
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 2xl:p-4">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="">
          <h1 className="font-semibold text-xl">Lab Tests</h1>
          <div className="hidden lg:flex items-center gap-1">
            <ClipboardList size={20} className="text-gray-500" />
            <p className="text-2xl font-semibold">{labTests?.length}</p>
            <span className="text-gray-600 text-sm xl:text-base">
              total records
            </span>
          </div>
        </div>
        {/* Bạn có thể thêm filter ở đây sau */}
      </div>

      <Table columns={columns} renderRow={renderRow} data={labTests} />
    </div>
  );
}
