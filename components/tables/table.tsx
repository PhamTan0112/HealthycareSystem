import React from "react";

interface TableProps {
  columns: { header: string; key: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}
export const Table = ({ columns, renderRow, data }: TableProps) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm lg:uppercase">
          {columns.map(({ header, key, className }) => (
            <th key={key} className={className}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.length < 1 && (
          <tr className="text-gray-400 text-base py-10">
            <td
              colSpan={3}
              className="text-center py-10 text-gray-400 text-base"
            >
              Không có dữ liệu
            </td>
          </tr>
        )}

        {data?.length > 0 &&
          data?.map((item, id) => renderRow({ ...item, index: id }))}
      </tbody>
    </table>
  );
};
