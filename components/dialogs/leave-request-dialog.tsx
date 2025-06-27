"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { toast } from "sonner";

const leaveTypes = [
  { value: "SICK_LEAVE", label: "Nghỉ ốm" },
  { value: "ANNUAL_LEAVE", label: "Nghỉ phép năm" },
  { value: "EMERGENCY_LEAVE", label: "Nghỉ khẩn cấp" },
  { value: "OTHER", label: "Khác" },
];

const LeaveRequestSchema = z.object({
  leave_type: z.enum(["SICK_LEAVE", "ANNUAL_LEAVE", "EMERGENCY_LEAVE", "OTHER"]),
  start_date: z.string().min(1, "Chọn ngày bắt đầu"),
  end_date: z.string().min(1, "Chọn ngày kết thúc"),
  reason: z.string().min(5, "Nhập lý do nghỉ"),
});

type LeaveRequestForm = z.infer<typeof LeaveRequestSchema>;

export function LeaveRequestDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<LeaveRequestForm>({
    resolver: zodResolver(LeaveRequestSchema),
    defaultValues: {
      leave_type: "SICK_LEAVE",
      start_date: "",
      end_date: "",
      reason: "",
    },
  });

  const onSubmit = async (values: LeaveRequestForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/leave-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gửi yêu cầu nghỉ phép thành công");
        setOpen(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(data.message || "Gửi yêu cầu thất bại");
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Đăng ký nghỉ phép</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng ký nghỉ phép</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm">Loại nghỉ</label>
            <Select
              value={form.watch("leave_type")}
              onValueChange={(val) => form.setValue("leave_type", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại nghỉ" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Từ ngày</label>
              <Input type="date" {...form.register("start_date")} />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">Đến ngày</label>
              <Input type="date" {...form.register("end_date")} />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm">Lý do</label>
            <Textarea rows={3} {...form.register("reason")} />
          </div>
          <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 