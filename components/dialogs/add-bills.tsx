"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { checkRole } from "@/utils/roles";

import { PatientBillSchema } from "@/lib/schema";
import { Services } from "@prisma/client";
import { z } from "zod";

import { Button } from "../ui/button";
import { CardDescription, CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { addNewBill } from "@/app/actions/medical";

interface DataProps {
  id?: string | number;
  appId?: string | number;
  servicesData: Services[];
}
export const AddBills = ({ id, appId, servicesData }: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<any>();
  const [canAdd, setCanAdd] = useState(false);

  const form = useForm<z.infer<typeof PatientBillSchema>>({
    resolver: zodResolver(PatientBillSchema),
    defaultValues: {
      bill_id: String(id),
      service_id: undefined,
      service_date: new Date().toDateString(),
      appointment_id: String(appId),
      quantity: "1",
      unit_cost: undefined,
      total_cost: undefined,
    },
  });

  useEffect(() => {
    async function checkPermission() {
      const isAdmin = await checkRole("ADMIN");
      const isDoctor = await checkRole("DOCTOR");
      setCanAdd(isAdmin || isDoctor);
    }
    checkPermission();
  }, []);

  const handleOnSubmit = async (values: z.infer<typeof PatientBillSchema>) => {
    try {
      setIsLoading(true);
      const resp = await addNewBill(values);

      if (resp.success) {
        toast.success("Thêm dịch vụ xét nghiệm thành công!");
        router.refresh();
        form.reset({
          bill_id: String(id),
          service_id: undefined,
          service_date: new Date().toDateString(),
          appointment_id: String(appId),
          quantity: "1",
          unit_cost: undefined,
          total_cost: undefined,
        });
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (servicesData) {
      setData(
        servicesData?.map((service) => ({
          value: service.id.toString(),
          label: service.service_name,
        }))
      );
    }
  }, [servicesData, id]);

  const selectedService = form.watch("service_id");

  useEffect(() => {
    if (selectedService) {
      const unit_cost = servicesData.find(
        (el) => el.id === Number(selectedService)
      );

      if (unit_cost) {
        form.setValue("unit_cost", unit_cost?.price.toFixed(2));
        form.setValue("total_cost", unit_cost?.price.toFixed(2));
      }
    }
  }, [selectedService, servicesData, form]);

  return (
    canAdd && (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="text-sm font-normal">
            <Plus size={22} className="text-gray-400" />
            Thêm dịch vụ xét nghiệm
          </Button>
        </DialogTrigger>
        <DialogContent>
          <CardHeader className="px-0">
            <DialogTitle>Thêm dịch vụ xét nghiệm</DialogTitle>
            <CardDescription>
              Chọn dịch vụ xét nghiệm cần thực hiện. Số lượng sẽ tự động được đặt là 1.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-8"
            >
              <div className="flex items-center gap-2">
                <CustomInput
                  type="select"
                  control={form.control}
                  name="service_id"
                  placeholder="Chọn dịch vụ xét nghiệm"
                  label="Tên dịch vụ"
                  selectList={data!}
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="unit_cost"
                  placeholder=""
                  label="Đơn giá"
                  disabled={true}
                />
              </div>

              <div className="flex items-center gap-2">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="quantity"
                  placeholder="1"
                  label="Số lượng"
                  disabled={true}
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="total_cost"
                  placeholder="0.00"
                  label="Thành tiền"
                  disabled={true}
                />
              </div>

              <CustomInput
                type="input"
                control={form.control}
                name="service_date"
                label="Ngày thực hiện"
                placeholder=""
                inputType="date"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 w-full"
              >
                Thêm dịch vụ
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  );
};
