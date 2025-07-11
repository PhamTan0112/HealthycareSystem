import { ViewAction } from "@/components/action-options";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { SearchParamsProps } from "@/types";
import { checkRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/setings";
import { getMedicalRecords } from "@/utils/services/medical-record";
import { Diagnosis, LabTest, MedicalRecords, Patient } from "@prisma/client";
import { format } from "date-fns";
import { BriefcaseBusiness } from "lucide-react";

interface ExtendedProps extends MedicalRecords {
  patient: Patient;
  diagnosis: Diagnosis[];
  lab_test: LabTest[];
}

const MedicalRecordsPage = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;
  const isPatient = await checkRole("PATIENT");

  // Định nghĩa columns dựa trên role
  const columns = [
    {
      header: "Bản ghi",
      key: "no",
    },
    ...(isPatient ? [] : [{
      header: "Thông tin",
      key: "name",
    }]),
    {
      header: "Ngày & Giờ",
      key: "medical_date",
      className: "hidden md:table-cell",
    },
    ...(isPatient ? [] : [{
      header: "Bác sĩ",
      key: "doctor",
      className: "hidden 2xl:table-cell",
    }]),
    {
      header: "Chẩn đoán",
      key: "diagnosis",
      className: "hidden lg:table-cell",
    },
    {
      header: "Xét nghiệm",
      key: "lab_test",
      className: "hidden 2xl:table-cell",
    },
    {
      header: "Thao tác",
      key: "action",
      className: "",
    },
  ];

  const { data, totalPages, totalRecords, currentPage } =
    await getMedicalRecords({
      page,
      search: searchQuery,
    });
  const isAdmin = await checkRole("ADMIN");

  if (!data) return null;

  const renderRow = (item: ExtendedProps) => {
    const name = item?.patient?.first_name + " " + item?.patient?.last_name;
    const patient = item?.patient;
    return (
      <tr
        key={item?.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="flex items-center gap-4 p-4">
          <ProfileImage
            url={item?.patient?.img!}
            name={name}
            bgColor={patient?.colorCode!}
            textClassName="text-black"
          />
          <div>
            <h3 className="uppercase">{name}</h3>
            <span className="text-sm capitalize">{patient?.gender}</span>
          </div>
        </td>
        {!isPatient && (
          <td className="hidden md:table-cell">
            <span className="text-sm">{patient?.email || "N/A"}</span>
          </td>
        )}
        <td className="hidden md:table-cell">
          {format(item?.created_at, "yyyy-MM-dd HH:mm:ss")}
        </td>
        {!isPatient && (
          <td className="hidden 2xl:table-cell">{item?.doctor_id}</td>
        )}
        <td className="hidden lg:table-cell">
          {item?.diagnosis?.length === 0 ? (
            <span className="text-gray-400 italic">Không tìm thấy</span>
          ) : (
            <span>{item?.diagnosis.length}</span>
          )}
        </td>
        <td className="hidden xl:table-cell">
          {item?.lab_test?.length === 0 ? (
            <span className="text-gray-400 italic">Không tìm thấy</span>
          ) : (
            <span>{item?.lab_test.length}</span>
          )}
        </td>

        <td>
          <ViewAction href={`/record/appointments/${item?.appointment_id}`} />
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <BriefcaseBusiness size={20} className="text-gray-500" />

          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">
            {isPatient ? "hồ sơ của bạn" : "hồ sơ"}
          </span>
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

export default MedicalRecordsPage;
