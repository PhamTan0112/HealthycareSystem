"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { FaQuestion } from "react-icons/fa6";
import { toast } from "sonner";
import { deleteDataById } from "@/app/actions/general";
import { ProfileImage } from "./profile-image";
import { SmallCard } from "./small-card";

interface ActionDialogProps {
  type: "doctor" | "staff" | "delete";
  id: string;
  data?: any;
  deleteType?: "doctor" | "staff" | "patient" | "payment" | "bill" | "labtest";
}

export const ActionDialog = ({
  id,
  data,
  type,
  deleteType,
}: ActionDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (type === "delete") {
    const handleDelete = async () => {
      try {
        setLoading(true);

        const res = await deleteDataById(id, deleteType!);

        if (res.success) {
          toast.success("Xóa thành công!");
          router.refresh();
        } else {
          toast.error("Xóa thất bại!");
        }
      } catch (error) {
        console.log(error);
        toast.error("Đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-center rounded-full text-red-500"
          >
            <Trash2 size={16} className="text-red-500" />
            {deleteType === "patient" && "Xoá"}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <div className="flex flex-col items-center justify-center py-6">
            <DialogTitle>
              <div className="bg-red-200 p-4 rounded-full mb-2">
                <FaQuestion size={50} className="text-red-500" />
              </div>
            </DialogTitle>

            <span className="text-xl text-black">Xác nhận xoá</span>
            <p className="text-sm text-center">
              Bạn có chắc chắn muốn xoá thông tin này không?
            </p>

            <div className="flex justify-center mt-6 items-center gap-x-3">
              <DialogClose asChild>
                <Button variant="outline" className="px-4 py-2">
                  Huỷ
                </Button>
              </DialogClose>

              <Button
                disabled={loading}
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-destructive text-white hover:bg-destructive hover:text-white"
                onClick={handleDelete}
              >
                Xác nhận xoá
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === "staff") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-center rounded-full text-blue-600/10 text-blue-600 hover:underline"
          >
            Xem
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[300px] md:max-w-2xl max-h-[90%] p-8 overflow-y-auto">
          <DialogTitle className="text-lg text-gray-600 font-semibold mb-4">
            Thông tin
          </DialogTitle>

          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <ProfileImage
                url={data?.img!}
                name={data?.name}
                className="xl:size-20"
                bgColor={data?.colorCode!}
                textClassName="xl:text-2xl"
              />

              <div className="flex flex-col">
                <p className="text-xl font-semibold">{data?.name}</p>
                <span className="text-gray-600 text-sm md:text-base capitalize">
                  {data?.role?.toLowerCase()}
                </span>
                <span className="text-blue-500 text-sm">Toàn thời gian</span>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-y-4 md:gap-x-0 xl:justify-between">
              <SmallCard label="Email" value={data?.email} />
              <SmallCard label="Số điện thoại" value={data?.phone} />
            </div>

            <div>
              <SmallCard label="Địa chỉ" value={data?.address || "Không có"} />
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-y-4 md:gap-x-0 xl:justify-between">
              <SmallCard label="Chức vụ" value={data?.role} />
              <SmallCard
                label="Phòng ban"
                value={data?.department || "Không có"}
              />
              <SmallCard
                label="Mã số"
                value={data?.license_number || "Không có"}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};
