"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { SwitchInput } from "../custom-input";
import { Label } from "../ui/label";
import { updateDoctorWorkingDays } from "@/app/actions/admin";

const WORKING_DAYS = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

type Day = {
  day: string;
  start_time?: string;
  close_time?: string;
};

interface Props {
  doctorId: string;
  initialSchedule: Day[];
}
export const DoctorWorkingDaysForm = ({ doctorId, initialSchedule }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<Day[]>(
    initialSchedule || []
  );

  const handleSubmit = async () => {
    if (workSchedule.length < 3) {
      toast.error("Vui lòng chọn ít nhất 3 ngày làm việc");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateDoctorWorkingDays(doctorId, workSchedule);

      if (res.success) {
        toast.success("Cập nhật lịch làm việc thành công");
        router.refresh();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật lịch");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Cập nhật lịch làm việc</Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl md:h-[90%] md:top-[5%] md:right-[1%] w-full overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Lịch làm việc của bác sĩ</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Label className="text-base">Chọn ít nhất 3 ngày</Label>
          <SwitchInput
            data={WORKING_DAYS}
            setWorkSchedule={setWorkSchedule}
            currentSchedule={workSchedule}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Đang lưu..." : "Lưu lịch làm việc"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
