"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { generateConflictTimeSlots } from "@/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@prisma/client";

export async function createNewAppointment(data: any) {
  try {
    const validatedData = AppointmentSchema.safeParse(data);

    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    const validated = validatedData.data;

    const appointmentDate = new Date(validated.appointment_date);
    const appointmentTimeParts = validated.time.split(":");
    const appointmentStart = new Date(appointmentDate);
    appointmentStart.setHours(
      +appointmentTimeParts[0],
      +appointmentTimeParts[1],
      0,
      0
    );

    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setHours(appointmentEnd.getHours() + 1);

    // ✅ Check nếu doctor đã có lịch trong khung giờ này
    const existing = await db.appointment.findFirst({
      where: {
        doctor_id: validated.doctor_id,
        appointment_date: appointmentDate,
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        time: {
          in: generateConflictTimeSlots(validated.time),
        },
      },
    });

    if (existing) {
      return {
        success: false,
        msg: "Doctor is not available at the selected time. Please choose another slot.",
      };
    }

    await db.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: validated.doctor_id,
        time: validated.time,
        type: validated.type,
        appointment_date: appointmentDate,
        note: validated.note,
      },
    });

    return {
      success: true,
      message: "Appointment booked successfully",
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,

  status: AppointmentStatus,
  reason: string
) {
  try {
    await db.appointment.update({
      where: { id: Number(id) },
      data: {
        status,
        reason,
      },
    });

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function addVitalSigns(
  data: VitalSignsFormData,
  appointmentId: string,
  doctorId: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const validatedData = VitalSignsSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: validatedData.patient_id,
          appointment_id: Number(appointmentId),
          doctor_id: doctorId,
        },
      });
    }

    const med_id = validatedData.medical_id || medicalRecord?.id;

    await db.vitalSigns.create({
      data: {
        ...validatedData,
        medical_id: Number(med_id!),
      },
    });

    return {
      success: true,
      msg: "Vital signs added successfully",
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}
