"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Ban, Check } from "lucide-react";
import { MdCancel } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { appointmentAction } from "@/app/actions/appointment";

interface ActionsProps {
  type: "approve" | "cancel";
  id: string | number;
  disabled: boolean;
}

export const AppointmentActionDialog = ({
  type,
  id,
  disabled,
}: ActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    if (type === "cancel" && !reason) {
      toast.error("Vui lòng nhập lý do huỷ lịch.");
      return;
    }

    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Cuộc hẹn đã được ${
          type === "approve" ? "xác nhận" : "huỷ"
        } vào ${new Date()}`;

      const resp = await appointmentAction(
        id,
        type === "approve" ? "SCHEDULED" : "CANCELLED",
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);
        setReason("");
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!disabled}>
        {type === "approve" ? (
          <Button size="sm" variant="ghost" className="w-full justify-start">
            <Check size={16} /> Xác nhận
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full flex items-center justify-start gap-2 rounded-full text-red-500 disabled:cursor-not-allowed"
          >
            <Ban size={16} /> Huỷ lịch
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col items-center justify-center py-6">
          <DialogTitle>
            {type === "approve" ? (
              <div className="bg-emerald-200 p-4 rounded-full mb-2">
                <GiConfirmed size={50} className="text-emerald-500" />
              </div>
            ) : (
              <div className="bg-red-200 p-4 rounded-full mb-2">
                <MdCancel size={50} className="text-red-500" />
              </div>
            )}
          </DialogTitle>

          <span className="text-xl text-black">
            {type === "approve" ? "Xác nhận lịch hẹn" : "Huỷ lịch hẹn"}
          </span>
          <p className="text-sm text-center text-gray-500">
            {type === "approve"
              ? "Bạn có chắc chắn muốn xác nhận cuộc hẹn này không?"
              : "Bạn có chắc chắn muốn huỷ cuộc hẹn này không?"}
          </p>

          {type === "cancel" && (
            <Textarea
              disabled={isLoading}
              className="mt-4"
              placeholder="Lý do huỷ lịch..."
              onChange={(e) => setReason(e.target.value)}
            ></Textarea>
          )}

          <div className="flex justify-center mt-6 items-center gap-x-4">
            <Button
              disabled={isLoading}
              onClick={handleAction}
              variant="outline"
              className={cn(
                "px-4 py-2 text-sm font-medium text-white hover:text-white hover:underline",
                type === "approve"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-destructive hover:bg-destructive"
              )}
            >
              {type === "approve" ? "Đồng ý" : "Xác nhận huỷ"}
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="px-4 py-2 text-sm underline text-gray-500"
              >
                Huỷ bỏ
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
