"use client";

import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

interface PaginationProps {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export const Pagination = ({
  totalPages,
  currentPage,
  totalRecords,
  limit,
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(
        pathname + "?" + createQueryString("p", (currentPage - 1).toString())
      );
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      router.push(
        pathname + "?" + createQueryString("p", (currentPage + 1).toString())
      );
    }
  };

  if (totalRecords === 0) return null;

  return (
    <div className="p-4 flex items-center justify-between text-gray600 mt-5">
      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === 1}
        onClick={handlePrevious}
        className="py-2 px-4 rounded-md bg-slate-200 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        Trước
      </Button>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-xs lg:text-sm">
          Hiển thị {currentPage * limit - (limit - 1)} đến{" "}
          {currentPage * limit <= totalRecords
            ? currentPage * limit
            : totalRecords}{" "}
          trên tổng số {totalRecords} bản ghi
        </span>
      </div>

      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={handleNext}
        className="py-2 px-4 rounded-md bg-slate-200 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tiếp theo
      </Button>
    </div>
  );
};
