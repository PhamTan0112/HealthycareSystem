"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { CardDescription, CardHeader } from "../ui/card";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

import { DiagnosisSchema } from "@/lib/schema";
import { Services } from "@prisma/client"; // 👈 dùng type Prisma
import { addDiagnosis } from "@/app/actions/medical";

// Props
interface AddDiagnosisProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId?: string;
  services: Services[];
}

// Form type mở rộng
export type DiagnosisFormData = z.infer<typeof DiagnosisSchema> & {
  request_labtest?: boolean;
  service_id?: number;
};

export const AddDiagnosis = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
  services,
}: AddDiagnosisProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requestLab, setRequestLab] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();

  const form = useForm<DiagnosisFormData>({
    resolver: zodResolver(DiagnosisSchema),
    defaultValues: {
      patient_id: patientId,
      doctor_id: doctorId,
      medical_id: Number(medicalId),
      symptoms: "",
      diagnosis: "",
      notes: "",
      prescribed_medications: "",
      follow_up_plan: "",
      request_labtest: false,
    },
  });

  const handleSubmit = async (data: DiagnosisFormData) => {
    setLoading(true);
    try {
      const response = await addDiagnosis(
        {
          ...data,
          medical_id: data.medical_id,
          request_labtest: requestLab,
          service_id: selectedService ? Number(selectedService) : undefined,
        },
        appointmentId
      );

      if (response.success) {
        toast.success(response.message);
        router.refresh();
        form.reset();
        setRequestLab(false);
        setSelectedService(undefined);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="bg-blue-600 text-white mt-4"
        >
          <Plus size={20} className="mr-2" />
          Thêm chẩn đoán
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[60%] 2xl:max-w-[40%]">
        <CardHeader className="px-0">
          <DialogTitle>Thêm chẩn đoán</DialogTitle>
          <CardDescription>Nhập thông tin chẩn đoán.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <CustomInput
              type="textarea"
              control={form.control}
              name="symptoms"
              label="Triệu chứng"
            />
            <CustomInput
              type="textarea"
              control={form.control}
              name="diagnosis"
              label="Chẩn đoán"
            />
            <CustomInput
              type="textarea"
              control={form.control}
              name="prescribed_medications"
              label="Đơn thuốc"
            />

            <div className="flex gap-4">
              <CustomInput
                type="textarea"
                control={form.control}
                name="notes"
                label="Ghi chú"
              />
              <CustomInput
                type="textarea"
                control={form.control}
                name="follow_up_plan"
                label="Kế hoạch theo dõi"
              />
            </div>

            {/* <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={requestLab}
                  onCheckedChange={(checked) => setRequestLab(!!checked)}
                />
                <Label>Yêu cầu xét nghiệm</Label>
              </div>

              {requestLab && (
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn dịch vụ xét nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id.toString()}
                      >
                        {service.service_name} - {service.price}₫
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div> */}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
