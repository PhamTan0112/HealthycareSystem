// app/(protected)/record/lab-tests/page.tsx

import { getAllLabTests } from "@/utils/services/labtest";
import { checkRole } from "@/utils/roles";
import { SearchParamsProps } from "@/types";
import { DATA_LIMIT } from "@/utils/setings";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { Table } from "@/components/tables/table";
import SearchInput from "@/components/search-input";
import { ViewAction } from "@/components/action-options";
import { ActionDialog } from "@/components/action-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const columns = [
  { header: "Service", key: "service" },
  { header: "Patient", key: "patient" },
  { header: "Date", key: "test_date", className: "hidden md:table-cell" },
  { header: "Result", key: "result", className: "hidden xl:table-cell" },
  { header: "Status", key: "status", className: "hidden xl:table-cell" },
  { header: "Actions", key: "action" },
];

const LabTestPage = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const response = await getAllLabTests({
    page: Number(page),
    limit: DATA_LIMIT,
    search: searchQuery,
  });

  if (!response?.success || !response.data) return null;

  const { data = [], currentPage, totalPages, totalRecords } = response;
  const isAdmin = await checkRole("ADMIN");

  const renderRow = (item: any) => {
    const name =
      item?.medical_record?.patient?.first_name +
      " " +
      item?.medical_record?.patient?.last_name;
    return (
      <tr
        key={item?.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td>{item?.services?.service_name}</td>
        <td>{name}</td>
        <td className="hidden md:table-cell">
          {format(new Date(item?.test_date), "yyyy-MM-dd")}
        </td>
        <td className="hidden xl:table-cell">{item?.result}</td>
        <td className="hidden xl:table-cell">
          <span
            className={cn(
              item.status === "PENDING"
                ? "text-orange-600"
                : item.status === "DONE"
                ? "text-emerald-600"
                : "text-gray-600"
            )}
          >
            {item?.status}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-2">
            <ViewAction href={`lab-tests/${item?.id}`} />
            {isAdmin && (
              <ActionDialog type="delete" id={item?.id} deleteType="labtest" />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <Users size={20} className="text-gray-500" />
          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">
            total lab tests
          </span>
        </div>

        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} data={data} renderRow={renderRow} />

        {totalPages && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalRecords={totalRecords}
            limit={DATA_LIMIT}
          />
        )}
      </div>
    </div>
  );
};

export default LabTestPage;
