"use server";

import db from "@/lib/db";
import { subMonths } from "date-fns";

export interface PatientSummary {
  full_name: string;
  gender: string;
  dob: string;
  visit_count: number;
  top_specialization: string;
  blood_pressure: {
    systolic: number | null;
    diastolic: number | null;
    text: string;
  };
  last_lab_test: string;
  last_doctor: {
    name: string;
    specialization: string;
  };
  recent_appointments: {
    date: string;
    doctor: string;
    specialization: string;
  }[]; // ✅ thêm mới
  summary_text: string;
  abnormal_flags: string[];
}

export async function analyzePatientData(
  userId: string
): Promise<PatientSummary> {
  const threeMonthsAgo = subMonths(new Date(), 3);

  const [patient, appointments, vitals, labs] = await Promise.all([
    db.patient.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        gender: true,
        date_of_birth: true,
      },
    }),
    db.appointment.findMany({
      where: {
        patient_id: userId,
        appointment_date: { gte: threeMonthsAgo },
      },
      orderBy: { appointment_date: "desc" },
      include: { doctor: true },
    }),
    db.vitalSigns.findMany({
      where: { patient_id: userId },
      orderBy: { created_at: "desc" },
      take: 1,
    }),
    db.labTest.findMany({
      where: {
        medical_record: {
          patient_id: userId,
        },
      },
      orderBy: { test_date: "desc" },
      take: 2,
      include: { services: true },
    }),
  ]);

  const fullName =
    `${patient?.last_name || ""} ${patient?.first_name || ""}`.trim() ||
    "Không rõ";
  const gender = patient?.gender === "FEMALE" ? "Nữ" : "Nam";
  const dob = patient?.date_of_birth?.toLocaleDateString("vi-VN") || "Không rõ";

  const visitCount = appointments.length;
  const commonSpec = appointments.reduce(
    (acc, appt) => {
      const key = appt.doctor?.specialization || "Khác";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topSpec =
    Object.entries(commonSpec).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Không xác định";

  const latestVital = vitals[0];
  const systolic = latestVital?.systolic ?? null;
  const diastolic = latestVital?.diastolic ?? null;
  const bpText =
    systolic && diastolic
      ? `${systolic}/${diastolic} mmHg`
      : "Không có dữ liệu";

  const lastLab = labs[0];
  const labText = lastLab
    ? `${lastLab.services.service_name}: ${lastLab.result}`
    : "Không có dữ liệu gần đây";

  const lastVisit = appointments[0];
  const lastDoctorName = lastVisit?.doctor?.name || "Không rõ";
  const lastDoctorSpec = lastVisit?.doctor?.specialization || "Không rõ";

  // ✅ 3 cuộc hẹn gần nhất
  const recentAppointments = appointments.slice(0, 3).map((appt) => ({
    date: appt.appointment_date.toLocaleDateString("vi-VN"),
    doctor: appt.doctor?.name || "Không rõ",
    specialization: appt.doctor?.specialization || "Không rõ",
  }));

  const abnormalFlags: string[] = [];
  if (systolic !== null && diastolic !== null) {
    if (systolic >= 140 || diastolic >= 90) abnormalFlags.push("Huyết áp cao");
    else if (systolic <= 90 || diastolic <= 60)
      abnormalFlags.push("Huyết áp thấp");
  }
  if (visitCount > 5) abnormalFlags.push("Tần suất khám cao bất thường");

  const summary = [
    `Họ tên: ${fullName}`,
    `Giới tính: ${gender}`,
    `Ngày sinh: ${dob}`,
    `Số lần khám trong 3 tháng: ${visitCount}`,
    `Chuyên khoa thường gặp: ${topSpec}`,
    `Huyết áp gần nhất: ${bpText}`,
    `Xét nghiệm gần nhất: ${labText}`,
    `Bác sĩ gần nhất: ${lastDoctorName} (${lastDoctorSpec})`,
  ].join("\n");

  return {
    full_name: fullName,
    gender,
    dob,
    visit_count: visitCount,
    top_specialization: topSpec,
    blood_pressure: {
      systolic,
      diastolic,
      text: bpText,
    },
    last_lab_test: labText,
    last_doctor: {
      name: lastDoctorName,
      specialization: lastDoctorSpec,
    },
    recent_appointments: recentAppointments, // ✅ thêm vào response
    summary_text: summary,
    abnormal_flags: abnormalFlags,
  };
}
