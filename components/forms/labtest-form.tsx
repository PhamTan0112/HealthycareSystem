"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LabTestSchema, LabTestFormValues } from "@/lib/schema";
import { createOrUpdateLabTest } from "@/app/actions/labtest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTransition } from "react";

interface LabTestFormProps {
  initialData?: Partial<LabTestFormValues>;
}

export const LabTestForm = ({ initialData }: LabTestFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LabTestFormValues>({
    resolver: zodResolver(LabTestSchema),
    defaultValues: {
      record_id: initialData?.record_id || 0,
      service_id: initialData?.service_id || 0,
      test_date: initialData?.test_date
        ? new Date(initialData.test_date)
        : new Date(),
      result: initialData?.result || "",
      status: initialData?.status || "pending",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = (data: LabTestFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value?.toString() || "");
    });

    startTransition(() => {
      createOrUpdateLabTest(formData)
        .then(() => toast.success("Lab test saved successfully"))
        .catch(() => toast.error("Failed to save lab test"));
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...form.register("record_id")}
        placeholder="Medical Record ID"
        type="number"
      />
      <Input
        {...form.register("service_id")}
        placeholder="Service ID"
        type="number"
      />
      <Input
        {...form.register("test_date")}
        placeholder="Test Date"
        type="date"
      />
      <Textarea {...form.register("result")} placeholder="Result" />
      <Select
        value={form.watch("status")}
        onValueChange={(val) => form.setValue("status", val as any)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Textarea {...form.register("notes")} placeholder="Notes (optional)" />
      <Button type="submit" disabled={isPending}>
        {initialData ? "Update Lab Test" : "Create Lab Test"}
      </Button>
    </form>
  );
};
