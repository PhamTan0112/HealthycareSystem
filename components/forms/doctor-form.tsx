"use client";

import { DoctorSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Form } from "../ui/form";
import { CustomInput, SwitchInput } from "../custom-input";
import { SPECIALIZATION } from "@/utils/setings";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { createNewDoctor } from "@/app/actions/admin";

const TYPES = [
  { label: "Full-Time", value: "FULL" },
  { label: "Part-Time", value: "PART" },
];

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

export const DoctorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<Day[]>([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof DoctorSchema>>({
    resolver: zodResolver(DoctorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      address: "",
      type: "FULL",
      department: "",
      img: "",
      password: "",
      license_number: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof DoctorSchema>) => {
    try {
      if (workSchedule.length === 0) {
        toast.error("Vui lòng chọn lịch làm việc");
        return;
      }

      setIsLoading(true);
      const resp = await createNewDoctor({
        ...values,
        work_schedule: workSchedule,
      });

      if (resp.success) {
        toast.success("Thêm bác sĩ thành công!");
        setWorkSchedule([]);
        form.reset();
        router.refresh();
      } else {
        toast.error(resp.message || "Thêm bác sĩ thất bại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSpecialization = form.watch("specialization");

  useEffect(() => {
    if (selectedSpecialization) {
      const department = SPECIALIZATION.find(
        (el) => el.value === selectedSpecialization
      );
      if (department) {
        form.setValue("department", department.department);
      }
    }
  }, [selectedSpecialization]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus size={20} />
          Thêm bác sĩ
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-xl md:h-[90%] md:top-[5%] md:right-[1%] w-full overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Thêm bác sĩ mới</SheetTitle>
        </SheetHeader>

        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 mt-5"
            >
              <CustomInput
                type="radio"
                selectList={TYPES}
                control={form.control}
                name="type"
                label="Hình thức làm việc"
                defaultValue="FULL"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="name"
                placeholder="Nhập họ tên bác sĩ"
                label="Họ và tên"
              />

              <div className="flex items-center gap-2">
                <CustomInput
                  type="select"
                  control={form.control}
                  name="specialization"
                  placeholder="Chọn chuyên khoa"
                  label="Chuyên khoa"
                  selectList={SPECIALIZATION}
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="department"
                  placeholder="Ví dụ: Khoa nội"
                  label="Khoa"
                />
              </div>

              <CustomInput
                type="input"
                control={form.control}
                name="license_number"
                placeholder="Số giấy phép hành nghề"
                label="Mã giấy phép"
              />

              <div className="flex items-center gap-2">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="email"
                  placeholder="example@email.com"
                  label="Email"
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="phone"
                  placeholder="Số điện thoại"
                  label="Số điện thoại"
                />
              </div>

              <CustomInput
                type="input"
                control={form.control}
                name="address"
                placeholder="Địa chỉ bác sĩ"
                label="Địa chỉ"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="password"
                placeholder="********"
                label="Mật khẩu đăng nhập"
                inputType="password"
              />

              <div className="mt-6">
                <Label>Chọn ngày làm việc</Label>
                <SwitchInput
                  data={WORKING_DAYS}
                  setWorkSchedule={setWorkSchedule}
                  currentSchedule={workSchedule}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Đang lưu..." : "Xác nhận thêm"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
