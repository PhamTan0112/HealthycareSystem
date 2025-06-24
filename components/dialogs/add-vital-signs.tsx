"use client";

import { addVitalSigns } from "@/app/actions/appointment";
import { VitalSignsSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";

interface AddVitalSignsProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId?: string;
}

export type VitalSignsFormData = z.infer<typeof VitalSignsSchema>;

export const AddVitalSigns = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
}: AddVitalSignsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      patient_id: patientId,
      medical_id: Number(medicalId),
      body_temperature: 0 || undefined,
      heartRate: undefined,
      systolic: 0 || undefined,
      diastolic: 0 || undefined,
      respiratory_rate: 0 || undefined,
      oxygen_saturation: 0 || undefined,
      weight: 0 || undefined,
      height: 0 || undefined,
    },
  });

  const handleOnSubmit = async (data: VitalSignsFormData) => {
    try {
      setIsLoading(true);

      const res = await addVitalSigns(data, appointmentId, doctorId);

      if (res.success) {
        router.refresh();
        toast.success(res.msg);
        form.reset();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể thêm chỉ số");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-sm font-normal">
          <Plus size={22} className="text-gray-500" /> Thêm chỉ số
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm chỉ số</DialogTitle>
          <DialogDescription>Nhập các chỉ số cho bệnh nhân</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <CustomInput
                type="input"
                control={form.control}
                name="body_temperature"
                label="Nhiệt độ cơ thể (°C)"
                placeholder="VD: 37.5"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="heartRate"
                placeholder="VD: 54-123"
                label="Nhịp tim (BPM)"
              />
            </div>

            <div className="flex items-center gap-4">
              <CustomInput
                type="input"
                control={form.control}
                name="systolic"
                placeholder="VD: 120"
                label="Huyết áp tâm thu"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="diastolic"
                placeholder="VD: 80"
                label="Huyết áp tâm trương"
              />
            </div>

            <div className="flex items-center gap-4">
              <CustomInput
                type="input"
                control={form.control}
                name="weight"
                placeholder="VD: 80"
                label="Cân nặng (Kg)"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="height"
                placeholder="VD: 175"
                label="Chiều cao (Cm)"
              />
            </div>

            <div className="flex items-center gap-4">
              <CustomInput
                type="input"
                control={form.control}
                name="respiratory_rate"
                placeholder="Không bắt buộc"
                label="Nhịp thở"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="oxygen_saturation"
                placeholder="Không bắt buộc"
                label="Độ bão hòa Oxy"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
