import db from "@/lib/db";
import { calculateDiscount } from "@/utils";
import { checkRole } from "@/utils/roles";
import { ReceiptText, FileText } from "lucide-react";
import { Table } from "../tables/table";
import { PatientBills } from "@prisma/client";
import { format } from "date-fns";
import { ActionDialog } from "../action-dialog";
import { Separator } from "../ui/separator";
import { GenerateFinalBills } from "./generate-final-bill";
import { auth } from "@clerk/nextjs/server";

const columns = [
  {
    header: "STT",
    key: "no",
    className: "hidden md:table-cell",
  },
  {
    header: "Dịch vụ xét nghiệm",
    key: "service",
  },
  {
    header: "Ngày thực hiện",
    key: "date",
    className: "",
  },
  {
    header: "Số lượng",
    key: "qnty",
    className: "hidden md:table-cell",
  },
  {
    header: "Đơn giá",
    key: "price",
    className: "hidden md:table-cell",
  },
  {
    header: "Thành tiền",
    key: "total",
    className: "",
  },
  {
    header: "Hành động",
    key: "action",
    className: "hidden xl:table-cell",
  },
];

interface ExtendedBillProps extends PatientBills {
  service: {
    service_name: string;
    id: number;
  };
}

export const BillsContainer = async ({ id }: { id: string }) => {
  const { userId } = await auth();
  const isPatient = await checkRole("PATIENT");
  const isAdmin = await checkRole("ADMIN");
  const isDoctor = await checkRole("DOCTOR");
  
  // Lay thong tin cuoc hen de kiem tra quyen
  const appointmentData = await db.appointment.findUnique({
    where: { id: Number(id) },
    include: {
      patient: true
    }
  });

  if (!appointmentData) {
    return (
      <div className="bg-white rounded-xl p-2 2xl:p-4">
        <div className="text-center py-8 text-gray-500">
          Khong tim thay cuoc hen
        </div>
      </div>
    );
  }

  // Tao dieu kien where cho payment
  let paymentWhereCondition: any = { appointment_id: Number(id) };
  
  // Neu la patient, chi lay hoa don cua chinh minh
  if (isPatient) {
    paymentWhereCondition.patient_id = userId;
  }

  const [data, completedLabTests] = await Promise.all([
    db.payment.findFirst({
      where: paymentWhereCondition,
      include: {
        bills: {
          include: {
            service: { select: { service_name: true, id: true } },
          },
          orderBy: { created_at: "asc" },
        },
      },
    }),
    // Lay danh sach xet nghiem da hoan thanh cho appointment nay
    db.labTest.findMany({
      where: {
        medical_record: {
          appointment_id: Number(id),
          ...(isPatient && { patient_id: userId! })
        },
        status: "COMPLETED",
      },
      include: {
        services: true,
      },
    }),
  ]);

  let totalBills = 0;

  const billData = data?.bills || [];
  const discount = data
    ? calculateDiscount({
        amount: data?.total_amount,
        discount: data?.discount,
      })
    : null;

  if (billData) {
    totalBills = billData.reduce((sum, acc) => sum + acc.total_cost, 0);
  }

  const renderRow = (item: ExtendedBillProps) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="hidden md:table-cell py-2 xl:py-6"># {item?.id}</td>

        <td className="items-center py-2">{item?.service?.service_name}</td>

        <td className="">{format(item?.service_date, "MMM d, yyyy")}</td>

        <td className="hidden items-center py-2  md:table-cell">
          {item?.quantity}
        </td>
        <td className="hidden lg:table-cell">{item?.unit_cost.toFixed(2)}</td>
        <td>{item?.total_cost.toFixed(2)}</td>

        <td className="hidden xl:table-cell">
          {/* Chỉ hiển thị nút xóa cho admin và doctor */}
          {(isAdmin || isDoctor) && (
            <ActionDialog
              type="delete"
              id={item?.id.toString()}
              deleteType="bill"
            />
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 2xl:p-4">
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="">
          <h1 className="font-semibold text-xl">Hóa đơn xét nghiệm</h1>
          <div className="hidden lg:flex items-center gap-1">
            <FileText size={20} className="text-gray-500" />
            <p className="text-2xl font-semibold">{billData?.length}</p>
            <span className="text-gray-600 text-sm xl:text-base">dịch vụ xét nghiệm</span>
          </div>
        </div>

        {((await checkRole("ADMIN")) || (await checkRole("DOCTOR"))) && (
          <div className="flex items-center mt-5 justify-end gap-2">
            <GenerateFinalBills 
              id={data?.id} 
              total_bill={totalBills} 
              appointmentId={id}
              completedLabTests={completedLabTests}
            />
          </div>
        )}
      </div>

      <Table columns={columns} renderRow={renderRow} data={billData!} />

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-2 text-center">
        <div>
          <span className="text-gray-500 block">Tổng tiền dịch vụ</span>
          <p className="text-xl font-semibold">
            {(data?.total_amount || totalBills).toFixed(2)}
          </p>
        </div>

        <div>
          <span className="text-gray-500 block">Giảm giá</span>
          <p className="text-xl font-semibold text-yellow-600">
            {(data?.discount || 0.0).toFixed(2)}{" "}
            <span className="text-sm text-gray-600">
              ({discount?.discountPercentage?.toFixed(2) || "0.0"}%)
            </span>
          </p>
        </div>

        <div>
          <span className="text-gray-500 block">Cần thanh toán</span>
          <p className="text-xl font-semibold">
            {(discount?.finalAmount || 0.0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Hướng dẫn khi chưa có hóa đơn */}
      {billData.length === 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <ReceiptText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Hóa đơn xét nghiệm</h3>
              <p className="mt-2 text-sm text-blue-800">
                Hóa đơn sẽ được tạo tự động khi xét nghiệm có trạng thái "COMPLETED". 
                Sau đó bạn có thể nhấn "Tạo hóa đơn cuối" để thêm giảm giá.
              </p>
              {completedLabTests.length > 0 && (
                <p className="mt-2 text-sm text-green-700">
                  Có {completedLabTests.length} xét nghiệm đã hoàn thành. 
                  Hóa đơn sẽ được tạo tự động.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
