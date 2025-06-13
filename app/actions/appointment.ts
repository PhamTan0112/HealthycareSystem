"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { generateConflictTimeSlots } from "@/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@prisma/client";
import { Resend } from "resend";

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

    // ✅ Tạo lịch hẹn mới (bỏ check trùng)
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

const resend = new Resend("re_asWTh6PN_AQu3UFHG4TvsPWajn6Lttwp8");

export async function sendAppointmentStatusEmail({
  to,
  patientName,
  doctorName,
  status,
  appointmentDate,
  time,
  reason,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  appointmentDate: string;
  time: string;
  reason?: string;
}) {
  let subject = "";
  let html = "";

  if (status === "CANCELLED") {
    subject = "Lịch hẹn của bạn đã bị hủy";
    html = `
      <p>Xin chào <strong>${patientName}</strong>,</p>
      <p>Lịch hẹn với bác sĩ <strong>${doctorName}</strong> vào <strong>${appointmentDate} lúc ${time}</strong> đã bị <strong>hủy</strong>.</p>
      ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ""}
      <p>Vui lòng đặt lại lịch nếu cần. Trân trọng,<br/>HealthyCare</p>
    `;
  } else {
    const statusText =
      status === "SCHEDULED" ? "đã được lên lịch" : "đã hoàn tất";
    subject =
      status === "SCHEDULED"
        ? "Lịch hẹn của bạn đã được lên lịch"
        : "Lịch hẹn của bạn đã hoàn tất";
    html = `
      <p>Xin chào <strong>${patientName}</strong>,</p>
      <p>Lịch hẹn với bác sĩ <strong>${doctorName}</strong> vào <strong>${appointmentDate} lúc ${time}</strong> ${statusText}.</p>
      <p>Trân trọng,<br/>HealthyCare</p>
    `;
  }

  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev", // hoặc dùng domain riêng đã verify
      to: "6251071088@st.utc2.edu.vn",
      subject,
      html,
    });

    console.log("Email send result:", result);

    if (result.error) {
      console.error("Email send error:", result.error);
    }
  } catch (err) {
    console.error("Resend Exception:", err);
  }
}

export async function sendAppointmentReminderEmails() {
  const today = new Date();
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(today.getDate() + 2);

  // Đặt ngày cần so sánh ở mức "yyyy-mm-dd"
  const dayStart = new Date(twoDaysLater.setHours(0, 0, 0, 0));
  const dayEnd = new Date(twoDaysLater.setHours(23, 59, 59, 999));

  const appointments = await db.appointment.findMany({
    where: {
      status: "SCHEDULED",
      appointment_date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: {
      patient: {
        select: {
          email: true,
          first_name: true,
          last_name: true,
        },
      },
      doctor: {
        select: {
          name: true,
        },
      },
    },
  });

  for (const appointment of appointments) {
    const email = appointment.patient.email;
    const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`;
    const doctorName = appointment.doctor.name;
    const date = appointment.appointment_date.toLocaleDateString("vi-VN");
    const time = appointment.time;

    await resend.emails.send({
      from: "onboarding@resend.dev", // đổi thành domain riêng nếu cần
      to: email,
      subject: "Nhắc lịch khám bệnh từ HealthyCare",
      html: `
        <p>Xin chào <strong>${patientName}</strong>,</p>
        <p>Đây là email nhắc lịch hẹn với bác sĩ <strong>${doctorName}</strong> vào <strong>${date} lúc ${time}</strong>.</p>
        <p>Vui lòng chuẩn bị đúng giờ và mang theo giấy tờ cần thiết.</p>
        <p>Trân trọng,<br/>HealthyCare</p>
      `,
    });

    console.log(`📨 Đã gửi nhắc lịch đến ${email}`);
  }
}

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
) {
  try {
    const updatedAppointment = await db.appointment.update({
      where: { id: Number(id) },
      data: {
        status,
        reason,
      },
      include: {
        patient: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        doctor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (
      status === "SCHEDULED" ||
      status === "COMPLETED" ||
      status === "CANCELLED"
    ) {
      await sendAppointmentStatusEmail({
        to: updatedAppointment.patient.email,
        patientName: `${updatedAppointment.patient.first_name} ${updatedAppointment.patient.last_name}`,
        doctorName: updatedAppointment.doctor.name,
        status,
        appointmentDate:
          updatedAppointment.appointment_date.toLocaleDateString("vi-VN"),
        time: updatedAppointment.time,
        reason,
      });
    }
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
