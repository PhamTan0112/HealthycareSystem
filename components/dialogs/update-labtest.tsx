"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { LabTest } from "@prisma/client";
import { useRouter } from "next/navigation";
import { updateLabTest } from "@/app/actions/labtest";

const LabTestSchema = z.object({
  test_date: z.string(),
  result: z.string().min(1),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED"]),
});

type LabTestFormData = z.infer<typeof LabTestSchema>;

interface UpdateLabTestDialogProps {
  labTest: LabTest;
}

export const UpdateLabTestDialog = ({ labTest }: UpdateLabTestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LabTestFormData>({
    resolver: zodResolver(LabTestSchema),
    defaultValues: {
      test_date: format(new Date(labTest.test_date), "yyyy-MM-dd"),
      result: labTest.result || "",
      notes: labTest.notes || "",
      status: labTest.status as "PENDING" | "COMPLETED",
    },
  });

  const onSubmit = async (values: LabTestFormData) => {
    setLoading(true);
    const res = await updateLabTest({
      id: labTest.id,
      ...values,
    });

    if (res.success) {
      toast.success("Cập nhật xét nghiệm thành công");
      router.refresh(); // reload lại trang server
    } else {
      toast.error(res.error || "Có lỗi xảy ra");
    }

    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Cập nhật</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Cập nhật xét nghiệm</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Ngày xét nghiệm</label>
              <Input type="date" {...form.register("test_date")} />
            </div>
            <CustomInput
              control={form.control}
              name="result"
              type="textarea"
              label="Kết quả"
            />
            <CustomInput
              control={form.control}
              name="notes"
              type="textarea"
              label="Ghi chú"
            />
            <div>
              <label className="block mb-1 text-sm">Trạng thái</label>
              <Select
                value={form.watch("status")}
                onValueChange={(val) => form.setValue("status", val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Xác nhận cập nhật"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
