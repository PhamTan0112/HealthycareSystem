"use client";

import { useUser } from "@clerk/nextjs";
import { Patient } from "@prisma/client";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Form } from "./ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from "@/lib/schema";
import { z } from "zod";
import { CustomInput } from "./custom-input";
import { GENDER, MARITAL_STATUS, RELATION } from "@/lib";
import { Button } from "./ui/button";
import { createNewPatient, updatePatient } from "@/app/actions/patient";
import { toast } from "sonner";

interface DataProps {
  data?: Patient;
  type: "create" | "update";
}
export const NewPatient = ({ data, type }: DataProps) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imgURL, setImgURL] = useState<any>();
  const router = useRouter();

  const userData = {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.emailAddresses[0].emailAddress || "",
    phone: user?.phoneNumbers?.toString() || "",
  };

  const userId = user?.id;
  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      ...userData,
      address: "",
      date_of_birth: new Date(),
      gender: "MALE",
      marital_status: "single",
      emergency_contact_name: "",
      emergency_contact_number: "",
      relation: "mother",
      blood_group: "",
      allergies: "",
      medical_conditions: "",
      insurance_number: "",
      insurance_provider: "",
      medical_history: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof PatientFormSchema>> = async (
    values
  ) => {
    setLoading(true);

    const res =
      type === "create"
        ? await createNewPatient(values, userId!)
        : await updatePatient(values, userId!);

    setLoading(false);

    if (res?.success) {
      toast.success(res.msg);
      form.reset();
      router.push("/patient");
    } else {
      console.log(res);
      toast.error("Failed to create patient");
    }
  };

  useEffect(() => {
    if (type === "create") {
      userData && form.reset({ ...userData });
    } else if (type === "update") {
      data &&
        form.reset({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          date_of_birth: new Date(data.date_of_birth),
          gender: data.gender,
          marital_status: data.marital_status as
            | "married"
            | "single"
            | "divorced"
            | "widowed"
            | "separated",
          address: data.address,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_number: data.emergency_contact_number,
          relation: data.relation as
            | "mother"
            | "father"
            | "husband"
            | "wife"
            | "other",
          blood_group: data?.blood_group!,
          allergies: data?.allergies! || "",
          medical_conditions: data?.medical_conditions! || "",
          medical_history: data?.medical_history! || "",
          insurance_number: data.insurance_number! || "",
          insurance_provider: data.insurance_provider! || "",
          medical_consent: data.medical_consent,
          privacy_consent: data.privacy_consent,
          service_consent: data.service_consent,
        });
    }
  }, [user]);

  return (
    <Card className="max-w-6xl w-full p-4">
      <CardHeader>
        <CardTitle>Đăng ký bệnh nhân</CardTitle>
        <CardDescription>
          Vui lòng cung cấp đầy đủ thông tin bên dưới để chúng tôi hiểu rõ hơn
          và mang đến dịch vụ chăm sóc sức khỏe chất lượng cho bạn.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-5"
          >
            <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>

            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput
                type="input"
                control={form.control}
                name="first_name"
                placeholder="Nguyễn"
                label="Họ"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="last_name"
                placeholder="Văn A"
                label="Tên"
              />
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="email"
              placeholder="nguyenvana@example.com"
              label="Địa chỉ email"
            />

            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput
                type="select"
                control={form.control}
                name="gender"
                placeholder="Chọn giới tính"
                label="Giới tính"
                selectList={GENDER!}
              />
              <CustomInput
                type="input"
                control={form.control}
                name="date_of_birth"
                placeholder="01-01-2000"
                label="Ngày sinh"
                inputType="date"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput
                type="input"
                control={form.control}
                name="phone"
                placeholder="0912345678"
                label="Số điện thoại"
              />
              <CustomInput
                type="select"
                control={form.control}
                name="marital_status"
                placeholder="Chọn tình trạng hôn nhân"
                label="Tình trạng hôn nhân"
                selectList={MARITAL_STATUS!}
              />
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="address"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              label="Địa chỉ"
            />

            <div className="space-y-8">
              <h3 className="text-lg font-semibold">Thông tin người thân</h3>
              <CustomInput
                type="input"
                control={form.control}
                name="emergency_contact_name"
                placeholder="Nguyễn Thị B"
                label="Họ tên người liên hệ khẩn cấp"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="emergency_contact_number"
                placeholder="0987654321"
                label="Số điện thoại người liên hệ"
              />
              <CustomInput
                type="select"
                control={form.control}
                name="relation"
                placeholder="Chọn mối quan hệ"
                label="Mối quan hệ"
                selectList={RELATION}
              />
            </div>

            <div className="space-y-8">
              <h3 className="text-lg font-semibold">Thông tin y tế</h3>

              <CustomInput
                type="input"
                control={form.control}
                name="blood_group"
                placeholder="A+"
                label="Nhóm máu"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="allergies"
                placeholder="Ví dụ: sữa, trứng..."
                label="Dị ứng"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="medical_conditions"
                placeholder="Bệnh lý đang mắc phải"
                label="Tình trạng bệnh lý"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="medical_history"
                placeholder="Tiền sử bệnh"
                label="Tiền sử bệnh"
              />
              <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-4">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="insurance_provider"
                  placeholder="Tên công ty bảo hiểm"
                  label="Nhà cung cấp bảo hiểm"
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="insurance_number"
                  placeholder="Số hợp đồng bảo hiểm"
                  label="Số bảo hiểm"
                />
              </div>
            </div>

            {type !== "update" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Đồng ý điều khoản
                </h3>

                <div className="space-y-6">
                  <CustomInput
                    name="privacy_consent"
                    label="Đồng ý chính sách quyền riêng tư"
                    placeholder="Tôi đồng ý cho phép thu thập, lưu trữ và sử dụng thông tin cá nhân cũng như dữ liệu sức khỏe của tôi như đã trình bày trong Chính sách quyền riêng tư. Tôi hiểu rõ quyền lợi của mình về việc truy cập, chỉnh sửa và xóa dữ liệu."
                    type="checkbox"
                    control={form.control}
                  />
                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="service_consent"
                    label="Đồng ý điều khoản dịch vụ"
                    placeholder="Tôi đồng ý với các điều khoản sử dụng, bao gồm quyền lợi và trách nhiệm khi sử dụng hệ thống quản lý y tế, cũng như các giới hạn trách nhiệm pháp lý."
                  />
                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="medical_consent"
                    label="Đồng ý điều trị"
                    placeholder="Tôi đồng ý được điều trị và nhận dịch vụ y tế qua hệ thống này. Tôi đã được thông báo rõ về phương án điều trị, rủi ro, lợi ích và quyền đặt câu hỏi trước khi tiến hành."
                  />
                </div>
              </div>
            )}

            <Button
              disabled={loading}
              type="submit"
              className="w-full md:w-fit px-6"
            >
              {type === "create" ? "Gửi đăng ký" : "Cập nhật"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
