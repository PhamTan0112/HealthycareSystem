import { ActionDialog } from "@/components/action-dialog";
import { ViewAction } from "@/components/action-options";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { cn } from "@/lib/utils";
import { SearchParamsProps } from "@/types";
import { checkRole, getRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/setings";
import { getPaymentRecords } from "@/utils/services/payments";
import { Patient, Payment } from "@prisma/client";
import { format } from "date-fns";
import { ReceiptText, Download, Eye } from "lucide-react";
import { DialogPayment } from "@/components/dialogs/payment-dialog";
import { BillDetailsDialog } from "@/components/dialogs/bill-details-dialog";
import { updatePaymentStatus } from "@/app/actions/payment";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";

const columns = [
  { header: "Mã hóa đơn", key: "id" },
  { header: "Thông tin bệnh nhân", key: "info" },
  { header: "Liên hệ", key: "phone", className: "hidden md:table-cell" },
  { header: "Ngày lập", key: "bill_date", className: "hidden md:table-cell" },
  { header: "Tổng tiền", key: "total", className: "hidden xl:table-cell" },
  { header: "Giảm giá", key: "discount", className: "hidden xl:table-cell" },
  { header: "Phải trả", key: "payable", className: "hidden xl:table-cell" },
  { header: "Trạng thái", key: "status", className: "hidden xl:table-cell" },
  { header: "Thao tác", key: "action" },
];

interface ExtendedProps extends Payment {
  patient: Patient;
}

const BillingPage = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const receiptNumber = Number(searchParams?.receipt_number);
  const statusFromQuery = searchParams?.status;

  if (receiptNumber && statusFromQuery === "PAID") {
    try {
      await updatePaymentStatus({ receiptNumber });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái payment:", error);
    }
  }

  // Lấy thông tin user hiện tại
  const { userId } = await auth();
  const userRole = await getRole();
  
  // Lấy patient ID nếu user là patient
  let patientId: string | undefined;
  if (userRole === "patient" && userId) {
    patientId = userId;
  }

  const { data, totalPages, totalRecords, currentPage } =
    await getPaymentRecords({ 
      page, 
      search: searchQuery,
      patientId,
      userRole
    });

  const isAdmin = await checkRole("ADMIN");
  const isPatient = userRole === "patient";

  if (!data) return null;

  const renderRow = (item: ExtendedProps) => {
    const name = item.patient.first_name + " " + item.patient.last_name;

    return (
      <tr
        key={`payment-${item.id}-patient-${item.patient.id}`}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="font-medium text-blue-700">#{item.id}</td>

        <td className="flex items-center gap-4 p-4">
          <ProfileImage
            url={item.patient.img!}
            name={name}
            bgColor={item.patient.colorCode!}
            textClassName="text-black"
          />
          <div>
            <h3 className="uppercase font-semibold">{name}</h3>
            <span className="text-sm capitalize text-gray-600">{item.patient.gender}</span>
          </div>
        </td>

        <td className="hidden md:table-cell">{item.patient.phone}</td>
        <td className="hidden md:table-cell">
          {format(item.bill_date, "dd/MM/yyyy")}
        </td>
        <td className="hidden xl:table-cell font-semibold">{item.total_amount.toLocaleString('vi-VN')}₫</td>
        <td className="hidden xl:table-cell text-green-600">{item.discount.toLocaleString('vi-VN')}₫</td>
        <td className="hidden xl:table-cell font-semibold text-blue-600">
          {(item.total_amount - item.discount).toLocaleString('vi-VN')}₫
        </td>

        <td className="hidden xl:table-cell">
          <span
            className={cn(
              "font-semibold uppercase px-2 py-1 rounded-full text-xs",
              item.status === "PAID"
                ? "bg-green-100 text-green-700"
                : item.status === "UNPAID"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
            )}
          >
            {item.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </td>

        <td className="flex gap-2">
          {/* Nút xem chi tiết hóa đơn */}
          <BillDetailsDialog
            paymentId={item.id}
            patientName={name}
            patientPhone={item.patient.phone}
            billDate={format(item.bill_date, "dd/MM/yyyy")}
            totalAmount={item.total_amount}
            discount={item.discount}
            amountPaid={item.amount_paid}
            status={item.status}
          />

          {/* Nút tải hóa đơn - chỉ hiển thị khi đã thanh toán */}
          {item.status === "PAID" && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Tải hóa đơn"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {/* Nút thanh toán - chỉ hiển thị khi chưa thanh toán và là patient */}
          {item.status === "UNPAID" && isPatient && (
            <DialogPayment 
              paymentId={item.id}
              totalAmount={item.total_amount}
              discount={item.discount}
              amountPaid={item.amount_paid}
            />
          )}

          {/* Nút xóa - chỉ admin mới có */}
          {isAdmin && (
            <ActionDialog
              type="delete"
              deleteType="payment"
              id={item.id.toString()}
            />
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ReceiptText size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              {isPatient ? "Hóa đơn của tôi" : "Quản lý hóa đơn"}
            </h1>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-gray-600">
            <span className="text-sm">Tổng cộng:</span>
            <span className="text-xl font-semibold text-blue-600">{totalRecords}</span>
            <span className="text-sm">hóa đơn</span>
          </div>
        </div>
        
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} data={data} renderRow={renderRow} />
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          totalRecords={totalRecords}
          limit={DATA_LIMIT}
        />
      </div>
    </div>
  );
};

export default BillingPage;
