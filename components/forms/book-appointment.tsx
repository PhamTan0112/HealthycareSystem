"use client";

import { AppointmentSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { UserPen } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
import { CustomTimeSelectWithServerAction } from "../custom-time-select";

const TYPES = [
  { label: "Khám tổng quát", value: "General Consultation" },
  { label: "Kiểm tra định kỳ", value: "General Check Up" },
  { label: "Khám thai", value: "Antenatal" },
  { label: "Thai sản", value: "Maternity" },
  { label: "Xét nghiệm", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

export const BookAppointment = ({
  data,
  doctors,
}: {
  data: Patient;
  doctors: Doctor[];
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
    },
  });

  const specializations = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialization))),
    [doctors]
  );

  const filteredDoctors = useMemo(
    () =>
      specialization
        ? doctors.filter((d) => d.specialization === specialization)
        : [],
    [doctors, specialization]
  );

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      const newData = { ...values, patient_id: data.id };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        router.refresh();
        toast.success("Đặt lịch hẹn thành công");
      } else {
        toast.error("Bác sĩ không khả dụng thời điểm này. Vui lòng chọn lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white"
        >
          <UserPen size={16} /> Đặt lịch hẹn
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl w-full">
        <div className="h-full overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>Đặt lịch khám</SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-5"
            >
              {/* Thông tin bệnh nhân */}
              <div className="w-full rounded-md border px-3 py-1 flex items-center gap-4">
                <ProfileImage
                  url={data?.img!}
                  name={`${data.first_name} ${data.last_name}`}
                  className="size-16 border"
                  bgColor={data?.colorCode!}
                />
                <div>
                  <p className="font-semibold text-lg">
                    {data.first_name} {data.last_name}
                  </p>
                  <span className="text-sm text-gray-500 capitalize">
                    {data?.gender}
                  </span>
                </div>
              </div>

              {/* Loại lịch hẹn */}
              <CustomInput
                type="select"
                selectList={TYPES}
                control={form.control}
                name="type"
                label="Loại lịch hẹn"
                placeholder="Chọn loại lịch hẹn"
              />

              {/* Chuyên khoa */}
              <FormItem>
                <FormLabel>Chuyên khoa</FormLabel>
                <Select
                  onValueChange={(val) => {
                    setSpecialization(val);
                    form.setValue("doctor_id", ""); // reset chọn bác sĩ nếu đổi chuyên khoa
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chuyên khoa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {/* Bác sĩ */}
              <FormField
                control={form.control}
                name="doctor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bác sĩ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!specialization || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bác sĩ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {filteredDoctors.map((i) => (
                          <SelectItem key={i.id} value={i.id} className="p-2">
                            <div className="flex gap-2 p-2">
                              <ProfileImage
                                url={i?.img!}
                                name={i?.name}
                                bgColor={i?.colorCode!}
                                textClassName="text-black"
                              />
                              <div>
                                <p className="font-medium">{i.name}</p>
                                <span className="text-sm text-gray-600">
                                  {i?.specialization}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngày và giờ khám */}
              <div className="flex items-center gap-2">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="appointment_date"
                  label="Ngày khám"
                  inputType="date"
                  placeholder=""
                />
                <CustomTimeSelectWithServerAction
                  name="time"
                  label="Giờ khám"
                  control={form.control}
                  doctorId={form.watch("doctor_id")}
                  appointmentDate={form.watch("appointment_date")}
                />
              </div>

              {/* Ghi chú */}
              <CustomInput
                type="textarea"
                control={form.control}
                name="note"
                label="Ghi chú thêm"
                placeholder="(Không bắt buộc)"
              />

              <Button
                disabled={isSubmitting}
                type="submit"
                className="bg-blue-600 w-full"
              >
                {isSubmitting ? "Đang gửi..." : "Xác nhận đặt lịch"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
