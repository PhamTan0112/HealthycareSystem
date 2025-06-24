"use client";

import { AppointmentStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";

interface ActionProps {
  id: string | number;
  status: string;
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Lịch hẹn đã được chuyển sang trạng thái ${selected.toLowerCase()} vào ${new Date()}`;

      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          disabled={status === "PENDING" || isLoading || status === "COMPLETED"}
          className="bg-yellow-200 text-black"
          onClick={() => setSelected("PENDING")}
        >
          Đang chờ
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "SCHEDULED" || isLoading || status === "COMPLETED"
          }
          className="bg-blue-200 text-black"
          onClick={() => setSelected("SCHEDULED")}
        >
          Đã xác nhận
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "COMPLETED" || isLoading || status === "COMPLETED"
          }
          className="bg-emerald-200 text-black"
          onClick={() => setSelected("COMPLETED")}
        >
          Đã hoàn tất
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "CANCELLED" || isLoading || status === "COMPLETED"
          }
          className="bg-red-200 text-black"
          onClick={() => setSelected("CANCELLED")}
        >
          Huỷ lịch
        </Button>
      </div>

      {selected === "CANCELLED" && (
        <Textarea
          disabled={isLoading}
          className="mt-4"
          placeholder="Nhập lý do huỷ lịch..."
          onChange={(e) => setReason(e.target.value)}
        />
      )}

      {selected && (
        <div className="flex items-center justify-between mt-6 bg-red-100 p-4 rounded">
          <p className="">Bạn có chắc chắn không?</p>
          <Button disabled={isLoading} type="button" onClick={handleAction}>
            Xác nhận
          </Button>
        </div>
      )}
    </div>
  );
};
