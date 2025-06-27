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
    // if (data.request_labtest && data.service_id) {
    //   await createLabTest({
    //     medical_id: Number(med_id),
    //     service_id: Number(data.service_id),
    //   });
    // }

    return {
      success: true,
      message: "Diagnosis created successfully.",
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

    // Đảm bảo quantity luôn = 1 cho dịch vụ xét nghiệm
    const quantity = 1;
    const unit_cost = Number(validatedData?.unit_cost);
    const total_cost = quantity * unit_cost;

    await db.patientBills.create({
      data: {
        bill_id: Number(bill_info?.id),
        service_id: Number(validatedData?.service_id),
        service_date: new Date(validatedData?.service_date!),
        quantity: quantity, // Cố định = 1
        unit_cost: unit_cost,
        total_cost: total_cost, // Tự động tính = 1 × unit_cost
      },
    });

    return {
      success: true,
      error: false,
      msg: `Dịch vụ xét nghiệm đã được thêm thành công`,
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

export async function generateBillWithAllServices(data: any) {
  try {
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: "You are not authorized to generate bills",
      };
    }

    const isValidData = PaymentSchema.safeParse(data);
    if (!isValidData.success) {
      return { success: false, error: true, msg: "Invalid data" };
    }

    const validatedData = isValidData.data;
    const { appointmentId, servicesData } = data;

    // Lấy thông tin appointment
    const appointment = await db.appointment.findUnique({
      where: { id: Number(appointmentId) },
      select: {
        id: true,
        patient_id: true,
      },
    });

    if (!appointment) {
      return { success: false, error: true, msg: "Appointment not found" };
    }

    // Kiểm tra xem đã có payment chưa
    let payment = await db.payment.findFirst({
      where: { appointment_id: Number(appointmentId) },
    });

    // Nếu chưa có payment, tạo mới
    if (!payment) {
      payment = await db.payment.create({
        data: {
          appointment_id: Number(appointmentId),
          patient_id: appointment.patient_id,
          bill_date: validatedData.bill_date,
          payment_date: new Date(),
          discount: 0.0,
          amount_paid: 0.0,
          total_amount: 0.0,
        },
      });
    }

    // Xóa tất cả PatientBills cũ (nếu có)
    await db.patientBills.deleteMany({
      where: { bill_id: payment.id },
    });

    // Tạo PatientBills cho tất cả dịch vụ xét nghiệm
    const patientBillsData = servicesData.map((service: any) => ({
      bill_id: payment.id,
      service_id: service.id,
      service_date: validatedData.bill_date,
      quantity: 1, // Cố định = 1
      unit_cost: service.price,
      total_cost: service.price, // 1 × service.price
    }));

    await db.patientBills.createMany({
      data: patientBillsData,
    });

    // Tính tổng tiền
    const totalAmount = servicesData.reduce(
      (sum: number, service: any) => sum + service.price,
      0
    );

    // Tính discount
    const discountPercent = Number(validatedData?.discount) || 0;
    const discountAmount = (discountPercent / 100) * totalAmount;

    // Cập nhật payment
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
      where: { id: Number(appointmentId) },
      data: {
        status: "COMPLETED",
      },
    });

    return {
      success: true,
      error: false,
      msg: "Hóa đơn xét nghiệm đã được tạo thành công",
    };
  } catch (error) {
    console.error("Generate Bill With All Services Error:", error);
    return { success: false, error: true, msg: "Internal server error" };
  }
}

export async function generateBillWithCompletedTests(data: any) {
  try {
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: "You are not authorized to generate bills",
      };
    }

    const isValidData = PaymentSchema.safeParse(data);
    if (!isValidData.success) {
      console.log("Validation error:", isValidData.error);
      return { success: false, error: true, msg: "Invalid data" };
    }
    
    console.log("check isValidData:", isValidData);
    const validatedData = isValidData.data;
    const { appointmentId, completedLabTests } = data;

    console.log("appointmentId:", appointmentId);
    console.log("completedLabTests:", completedLabTests);

    // Lấy thông tin appointment
    const appointment = await db.appointment.findUnique({
      where: { id: Number(appointmentId) },
      select: {
        id: true,
        patient_id: true,
      },
    });

    if (!appointment) {
      return { success: false, error: true, msg: "Appointment not found" };
    }

    // Kiểm tra xem đã có payment chưa
    let payment = await db.payment.findFirst({
      where: { appointment_id: Number(appointmentId) },
    });

    // Nếu chưa có payment, tạo mới
    if (!payment) {
      payment = await db.payment.create({
        data: {
          appointment_id: Number(appointmentId),
          patient_id: appointment.patient_id,
          bill_date: validatedData.bill_date,
          payment_date: new Date(),
          discount: 0.0,
          amount_paid: 0.0,
          total_amount: 0.0,
        },
      });
    }

    // Xóa tất cả PatientBills cũ (nếu có)
    await db.patientBills.deleteMany({
      where: { bill_id: payment.id },
    });

    // Tạo PatientBills cho các xét nghiệm đã hoàn thành
    const patientBillsData = completedLabTests.map((labTest: any) => ({
      bill_id: payment.id,
      service_id: labTest.services.id,
      service_date: validatedData.bill_date,
      quantity: 1, // Cố định = 1
      unit_cost: labTest.services.price,
      total_cost: labTest.services.price, // 1 × labTest.services.price
    }));

    console.log("patientBillsData:", patientBillsData);

    // Tạo PatientBills
    await db.patientBills.createMany({
      data: patientBillsData,
    });

    // Tính tổng tiền từ các xét nghiệm đã hoàn thành
    const totalAmount = completedLabTests.reduce(
      (sum: number, labTest: any) => sum + labTest.services.price,
      0
    );

    // Tính discount
    const discountPercent = Number(validatedData?.discount) || 0;
    const discountAmount = (discountPercent / 100) * totalAmount;

    console.log("totalAmount:", totalAmount);
    console.log("discountPercent:", discountPercent);
    console.log("discountAmount:", discountAmount);

    // Cập nhật payment với giảm giá
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
      where: { id: Number(appointmentId) },
      data: {
        status: "COMPLETED",
      },
    });

    return {
      success: true,
      error: false,
      msg: "Hóa đơn cuối cùng đã được tạo thành công",
    };
  } catch (error) {
    console.error("Generate Bill With Completed Tests Error:", error);
    return { success: false, error: true, msg: "Internal server error" };
  }
}
