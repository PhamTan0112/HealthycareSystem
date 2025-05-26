"use server";

import db from "@/lib/db";

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
