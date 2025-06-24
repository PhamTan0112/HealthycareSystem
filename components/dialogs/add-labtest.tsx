"use client";

import { useState, useTransition } from "react";
import { createLabTest } from "@/app/actions/labtest";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

export const AddLabTestDialog = ({
  medicalId,
  services,
}: {
  medicalId: number;
  services: any[];
}) => {
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!selectedService) return toast.error("Chưa chọn dịch vụ");

    startTransition(async () => {
      const res = await createLabTest({
        medical_id: medicalId,
        service_id: Number(selectedService),
      });

      if (res.success) {
        toast.success("Đã thêm xét nghiệm");
        setSelectedService(undefined);
      } else {
        toast.error(res.error || "Lỗi khi thêm");
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          + Thêm xét nghiệm
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-50">
        <DialogHeader>
          <DialogTitle>Thêm xét nghiệm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn dịch vụ xét nghiệm" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.service_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSubmit} disabled={pending || !selectedService}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
