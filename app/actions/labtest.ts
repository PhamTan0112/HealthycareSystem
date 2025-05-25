"use server";

import { LabTestSchema } from "@/lib/schema";
import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createOrUpdateLabTest(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const raw = Object.fromEntries(formData.entries());
  const parsed = LabTestSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid input");

  const data = parsed.data;

  if (data.id) {
    await db.labTest.update({
      where: { id: data.id },
      data: {
        result: data.result,
        status: data.status,
        notes: data.notes,
        test_date: data.test_date,
      },
    });
  } else {
    await db.labTest.create({
      data: {
        record_id: data.record_id,
        service_id: data.service_id,
        test_date: data.test_date,
        result: data.result,
        status: data.status,
        notes: data.notes,
      },
    });
  }

  revalidatePath("/record/labtest");
}
