"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { generateBillWithCompletedTests } from "@/app/actions/medical";
import { PaymentSchema } from "@/lib/schema";
import { LabTest, Services } from "@prisma/client";
import { z } from "zod";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import { CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";

interface DataProps {
  id?: string | number;
  total_bill: number;
  appointmentId: string;
  completedLabTests: (LabTest & { services: Services })[];
}

export const GenerateFinalBills = ({
  id,
  total_bill,
  appointmentId,
  completedLabTests,
}: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Tính tổng tiền các xét nghiệm đã hoàn thành
  const totalCompletedTests = completedLabTests.reduce(
    (sum, labTest) => sum + labTest.services.price,
    0
  );

  const form = useForm<z.infer<typeof PaymentSchema>>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      id: String(id || ""),
      discount: "0",
      bill_date: new Date(),
      total_amount: String(totalCompletedTests),
    },
  });

  const handleOnSubmit = async (values: z.infer<typeof PaymentSchema>) => {
    try {
      console.log("Submitting form with values:", values);
      setIsLoading(true);
      
      const resp = await generateBillWithCompletedTests({
        ...values,
        appointmentId,
        completedLabTests,
      });

      console.log("Response from generateBillWithCompletedTests:", resp);

      if (resp.success) {
        toast.success("Hóa đơn cuối cùng đã được tạo thành công!");
        router.refresh();
        form.reset();
      } else {
        toast.error(resp.msg || "Có lỗi xảy ra khi tạo hóa đơn");
      }
    } catch (error) {
      console.error("Error in handleOnSubmit:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log("check: ", completedLabTests.length);
  console.log("completedLabTests:", completedLabTests);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm font-normal">
          <Receipt size={22} className="text-gray-400" />
          Tạo hóa đơn cuối
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CardHeader className="px-0">
          <DialogTitle>Tạo hóa đơn cuối cùng</DialogTitle>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="">
                  <span>Tổng tiền xét nghiệm đã hoàn thành</span>
                  <p className="text-3xl font-semibold">
                    {totalCompletedTests?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Hiển thị danh sách xét nghiệm đã hoàn thành */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Xét nghiệm đã hoàn thành:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {completedLabTests.map((labTest) => (
                    <div
                      key={labTest.id}
                      className="flex justify-between text-sm"
                    >
                      <span>{labTest.services.service_name}</span>
                      <span className="font-medium">
                        {labTest.services.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                {completedLabTests.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Chưa có xét nghiệm nào hoàn thành
                  </p>
                )}
              </div>
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="discount"
              placeholder="vd: 5"
              label="Giảm giá (%)"
            />

            <CustomInput
              type="input"
              control={form.control}
              name="bill_date"
              label="Ngày tạo hóa đơn"
              placeholder=""
              inputType="date"
            />

            <Button
              type="submit"
              disabled={isLoading || completedLabTests.length === 0}
              className="bg-green-600 w-full"
            >
              {isLoading ? "Đang tạo..." : "Tạo hóa đơn cuối cùng"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
