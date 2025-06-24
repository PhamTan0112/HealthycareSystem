import db from "@/lib/db";
import { Table } from "../tables/table";
import { Payment } from "@prisma/client";
import { format } from "date-fns";
import { ViewAction } from "../action-options";
import { checkRole } from "@/utils/roles";
import { ActionDialog } from "../action-dialog";

const columns = [
  {
    header: "STT",
    key: "id",
  },
  {
    header: "Ngày tạo",
    key: "bill_date",
    className: "",
  },
  {
    header: "Ngày thanh toán",
    key: "pay_date",
    className: "hidden md:table-cell",
  },
  {
    header: "Tổng tiền",
    key: "total",
    className: "",
  },
  {
    header: "Giảm giá",
    key: "discount",
    className: "hidden xl:table-cell",
  },
  {
    header: "Cần trả",
    key: "payable",
    className: "hidden xl:table-cell",
  },
  {
    header: "Đã trả",
    key: "paid",
    className: "hidden xl:table-cell",
  },
  {
    header: "Thao tác",
    key: "action",
  },
];

export const PaymentsContainer = async ({
  patientId,
}: {
  patientId: string;
}) => {
  const data = await db.payment.findMany({
    where: { patient_id: patientId },
  });

  if (!data) return null;
  const isAdmin = await checkRole("ADMIN");

  const renderRow = (item: Payment) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4">
          #{item?.id}
        </td>

        <td className="lowercase">{format(item?.bill_date, "dd/MM/yyyy")}</td>
        <td className="hidden items-center py-2 md:table-cell">
          {format(item?.payment_date, "dd/MM/yyyy")}
        </td>
        <td className="">{item?.total_amount.toFixed(2)}</td>
        <td className="hidden xl:table-cell">{item?.discount.toFixed(2)}</td>
        <td className="hidden xl:table-cell">
          {(item?.total_amount - item?.discount).toFixed(2)}
        </td>
        <td className="hidden xl:table-cell">{item?.amount_paid.toFixed(2)}</td>

        <td className="">
          <div className="flex items-center">
            <ViewAction
              href={`/record/appointments/${item?.appointment_id}?cat=bills`}
            />
            {isAdmin && (
              <ActionDialog
                type="delete"
                deleteType="payment"
                id={item?.id.toString()}
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <p className="text-2xl font-semibold">{data?.length ?? 0}</p>
          <span className="text-gray-600 text-sm xl:text-base">tổng lượt</span>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};
