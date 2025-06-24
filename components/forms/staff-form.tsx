"use client";

import { StaffSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { CustomInput } from "../custom-input";
import { toast } from "sonner";
import { createNewStaff } from "@/app/actions/admin";

const TYPES = [{ label: "Y tá", value: "NURSE" }];

export const StaffForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof StaffSchema>>({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "NURSE",
      address: "",
      department: "",
      img: "",
      password: "",
      license_number: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof StaffSchema>) => {
    try {
      setIsLoading(true);
      const resp = await createNewStaff(values);

      if (resp.success) {
        toast.success("Thêm nhân viên thành công!");
        form.reset();
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus size={20} />
          Thêm nhân viên
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-xl md:h-[90%] md:top-[5%] md:right-[1%] w-full overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Thêm nhân viên mới</SheetTitle>
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
                name="role"
                label="Chức vụ"
                defaultValue="NURSE"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="name"
                placeholder="Nhập họ tên"
                label="Họ và tên"
              />

              <div className="flex items-center gap-2">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="email"
                  placeholder="nhanvien@example.com"
                  label="Email"
                />

                <CustomInput
                  type="input"
                  control={form.control}
                  name="phone"
                  placeholder="Số điện thoại"
                  label="Điện thoại"
                />
              </div>

              <CustomInput
                type="input"
                control={form.control}
                name="license_number"
                placeholder="Số giấy phép"
                label="Mã giấy phép"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="department"
                placeholder="Khoa Nhi / Nội trú"
                label="Khoa / Phòng ban"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="address"
                placeholder="Địa chỉ"
                label="Địa chỉ"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="password"
                placeholder="********"
                label="Mật khẩu"
                inputType="password"
              />

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
