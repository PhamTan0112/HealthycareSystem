"use server";

import { ReviewFormValues, reviewSchema } from "@/lib/schema";

import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";

export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill" | "labtest"
) {
  try {
    // Kiểm tra quyền cho lab test
    if (deleteType === "labtest") {
      const isAdmin = await checkRole("ADMIN");
      const isDoctor = await checkRole("DOCTOR");
      const isNurse = await checkRole("NURSE");

      if (!isAdmin && !isDoctor && !isNurse) {
        return {
          success: false,
          message: "Bạn không có quyền xóa xét nghiệm",
          status: 403,
        };
      }
    }

    // Kiểm tra quyền cho bill
    if (deleteType === "bill") {
      const isAdmin = await checkRole("ADMIN");
      const isDoctor = await checkRole("DOCTOR");

      if (!isAdmin && !isDoctor) {
        return {
          success: false,
          message: "Bạn không có quyền xóa hóa đơn",
          status: 403,
        };
      }
    }

    // Kiểm tra quyền cho payment
    if (deleteType === "payment") {
      const isAdmin = await checkRole("ADMIN");

      if (!isAdmin) {
        return {
          success: false,
          message: "Bạn không có quyền xóa thanh toán",
          status: 403,
        };
      }
    }

    switch (deleteType) {
      case "doctor":
        await db.doctor.delete({ where: { id: id } });
        break;
      case "staff":
        await db.staff.delete({ where: { id: id } });
        break;
      case "patient":
        await db.patient.delete({ where: { id: id } });
        break;
      case "payment":
        await db.payment.delete({ where: { id: Number(id) } });
        break;
      case "bill":
        await db.patientBills.delete({ where: { id: Number(id) } });
        break;
      case "labtest":
        await db.labTest.delete({ where: { id: Number(id) } });
        break;
    }

    if (
      deleteType === "staff" ||
      deleteType === "patient" ||
      deleteType === "doctor"
    ) {
      const client = await clerkClient();
      await client.users.deleteUser(id);
    }

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const validatedFields = reviewSchema.parse(values);

    await db.rating.create({
      data: {
        ...validatedFields,
      },
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (err: any) {
    console.error("❌ Error in createReview:", err);
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}
