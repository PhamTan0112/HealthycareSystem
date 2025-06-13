// app/actions/doctor.ts
"use server";

import { getAvailableSlotsForDoctor } from "@/utils";

export async function getAvailableTimesAction(doctorId: string, date: string) {
  if (!doctorId || !date) return [];

  const dateObj = new Date(date);
  const result = await getAvailableSlotsForDoctor(doctorId, dateObj);

  return result.map((t) => ({ label: t, value: t }));
}
