"use server";

import db from "@/lib/db";

interface CreateLabTestInput {
  medical_id: number;
  service_id: number;
}

export const createLabTest = async ({
  medical_id,
  service_id,
}: CreateLabTestInput) => {
  try {
    // Kiểm tra service tồn tại
    const service = await db.services.findUnique({
      where: { id: service_id },
    });

    if (!service) {
      return { error: "Service not found" };
    }

    // Tạo mới LabTest
    await db.labTest.create({
      data: {
        record_id: medical_id,
        service_id,
        test_date: new Date(),
        result: "",
        notes: "",
        status: "PENDING",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Create LabTest Error:", error);
    return { error: "Failed to create lab test" };
  }
};
interface UpdateLabTestInput {
  id: number;
  test_date: string;
  result: string;
  notes?: string;
  status: string;
}

export const updateLabTest = async (data: UpdateLabTestInput) => {
  try {
    await db.labTest.update({
      where: { id: data.id },
      data: {
        test_date: new Date(data.test_date),
        result: data.result,
        notes: data.notes,
        status: data.status,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("UpdateLabTest error:", error);
    return { error: "Không thể cập nhật lab test" };
  }
};
