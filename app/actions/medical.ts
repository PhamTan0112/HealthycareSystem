"use server";

import { DiagnosisFormData } from "@/components/dialogs/add-diagnosis";
import db from "@/lib/db";
import {
  DiagnosisSchema,
  PatientBillSchema,
  PaymentSchema,
} from "@/lib/schema";
import { checkRole } from "@/utils/roles";
import { createLabTest } from "./labtest";

interface ExtendedDiagnosisData {
  patient_id: string;
  doctor_id: string;
  medical_id?: number;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  prescribed_medications?: string;
  follow_up_plan?: string;
  request_labtest?: boolean;
  service_id?: number;
}

export const addDiagnosis = async (
  data: ExtendedDiagnosisData,
  appointmentId: string
) => {
  try {
    const validatedData = DiagnosisSchema.parse(data);

    let medicalRecord = null;

    if (!data.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          appointment_id: Number(appointmentId),
        },
      });
    }

    const med_id = data.medical_id || medicalRecord?.id;

    // Tạo Diagnosis
    await db.diagnosis.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        medical_id: Number(med_id),
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        notes: data.notes,
        prescribed_medications: data.prescribed_medications,
        follow_up_plan: data.follow_up_plan,
      },
    });

    // Nếu có yêu cầu xét nghiệm → Gọi action riêng
    if (data.request_labtest && data.service_id) {
      await createLabTest({
        medical_id: Number(med_id),
        service_id: Number(data.service_id),
      });
    }

    return {
      success: true,
      message: "Diagnosis and lab test (if any) created successfully.",
    };
  } catch (error) {
    console.error("Add diagnosis error:", error);
    return { error: "Failed to add diagnosis" };
  }
};
export async function addNewBill(data: any) {
  try {
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: "You are not authorized to add a bill",
      };
    }

    const isValidData = PatientBillSchema.safeParse(data);

    const validatedData = isValidData.data;
    let bill_info = null;

    if (!data?.bill_id || data?.bill_id === "undefined") {
      const info = await db.appointment.findUnique({
        where: { id: Number(data?.appointment_id)! },
        select: {
          id: true,
          patient_id: true,
          bills: {
            where: {
              appointment_id: Number(data?.appointment_id),
            },
          },
        },
      });

      if (!info?.bills?.length) {
        bill_info = await db.payment.create({
          data: {
            appointment_id: Number(data?.appointment_id),
            patient_id: info?.patient_id!,
            bill_date: new Date(),
            payment_date: new Date(),
            discount: 0.0,
            amount_paid: 0.0,
            total_amount: 0.0,
          },
        });
      } else {
        bill_info = info?.bills[0];
      }
    } else {
      bill_info = {
        id: data?.bill_id,
      };
    }

    await db.patientBills.create({
      data: {
        bill_id: Number(bill_info?.id),
        service_id: Number(validatedData?.service_id),
        service_date: new Date(validatedData?.service_date!),
        quantity: Number(validatedData?.quantity),
        unit_cost: Number(validatedData?.unit_cost),
        total_cost: Number(validatedData?.total_cost),
      },
    });

    return {
      success: true,
      error: false,
      msg: `Bill added successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function generateBill(data: any) {
  try {
    const isValidData = PaymentSchema.safeParse(data);
    if (!isValidData.success) {
      return { success: false, error: true, msg: "Invalid data" };
    }

    const validatedData = isValidData.data;

    // Lấy bản ghi payment
    const payment = await db.payment.findUnique({
      where: { id: Number(validatedData.id) },
      include: { bills: true, appointment: true },
    });

    if (!payment) {
      return { success: false, error: true, msg: "Payment not found" };
    }

    // Không cho cập nhật nếu đã completed
    // if (payment.appointment.status === "COMPLETED") {
    //   return {
    //     success: false,
    //     error: true,
    //     msg: "Appointment is already completed",
    //   };
    // }

    // Tính lại total_amount từ bills
    const totalAmount = payment.bills.reduce((acc, bill) => {
      return acc + bill.total_cost;
    }, 0);

    // Tính discount
    const discountPercent = Number(validatedData?.discount) || 0;
    const discountAmount = (discountPercent / 100) * totalAmount;

    // Cập nhật lại payment
    await db.payment.update({
      where: { id: payment.id },
      data: {
        total_amount: totalAmount,
        discount: discountAmount,
        bill_date: validatedData.bill_date,
      },
    });

    // Đánh dấu appointment là đã hoàn tất
    await db.appointment.update({
      where: { id: payment.appointment_id },
      data: {
        status: "COMPLETED",
      },
    });

    return {
      success: true,
      error: false,
      msg: "Bill generated successfully",
    };
  } catch (error) {
    console.error("Generate Bill Error:", error);
    return { success: false, error: true, msg: "Internal server error" };
  }
}

export const updateLabTestResult = async ({
  id,
  result,
  notes,
}: {
  id: number;
  result: string;
  notes?: string;
}) => {
  await db.labTest.update({
    where: { id },
    data: {
      result,
      notes,
      status: "DONE",
      test_date: new Date(),
    },
  });
};

export const getAllServices = async () => {
  return await db.services.findMany({
    orderBy: { service_name: "asc" },
  });
};
