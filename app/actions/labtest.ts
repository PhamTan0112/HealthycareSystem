"use server";

import db from "@/lib/db";
import { checkRole } from "@/utils/roles";

interface CreateLabTestInput {
  medical_id: number;
  service_id: number;
}

export const createLabTest = async ({
  medical_id,
  service_id,
}: CreateLabTestInput) => {
  try {
    // Kiểm tra quyền - chỉ admin, doctor, nurse mới được tạo lab test
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");
    const isNurse = await checkRole("NURSE");

    if (!isAdmin && !isDoctor && !isNurse) {
      return { error: "Bạn không có quyền tạo xét nghiệm" };
    }

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
    // Kiểm tra quyền - chỉ admin, doctor, nurse mới được cập nhật lab test
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");
    const isNurse = await checkRole("NURSE");

    if (!isAdmin && !isDoctor && !isNurse) {
      return { error: "Bạn không có quyền cập nhật xét nghiệm" };
    }

    // Cập nhật LabTest
    const updatedLabTest = await db.labTest.update({
      where: { id: data.id },
      data: {
        test_date: new Date(data.test_date),
        result: data.result,
        notes: data.notes,
        status: data.status,
      },
      include: {
        services: true,
        medical_record: {
          include: {
            appointment: true,
          },
        },
      },
    });

    // Nếu trạng thái là COMPLETED, tự động tạo hóa đơn
    if (data.status === "COMPLETED") {
      await createBillForCompletedLabTest(updatedLabTest);
    }

    return { success: true };
  } catch (error) {
    console.error("UpdateLabTest error:", error);
    return { error: "Không thể cập nhật lab test" };
  }
};

// Hàm tạo hóa đơn cho xét nghiệm đã hoàn thành
async function createBillForCompletedLabTest(labTest: any) {
  try {
    const { services, medical_record } = labTest;
    const appointmentId = medical_record.appointment.id;

    // Kiểm tra xem đã có payment chưa
    let payment = await db.payment.findFirst({
      where: { appointment_id: appointmentId },
    });

    // Nếu chưa có payment, tạo mới
    if (!payment) {
      payment = await db.payment.create({
        data: {
          appointment_id: appointmentId,
          patient_id: medical_record.patient_id,
          bill_date: new Date(),
          payment_date: new Date(),
          discount: 0.0,
          amount_paid: 0.0,
          total_amount: 0.0,
        },
      });
    }

    // Kiểm tra xem đã có PatientBills cho service này chưa
    const existingBill = await db.patientBills.findFirst({
      where: {
        bill_id: payment.id,
        service_id: services.id,
      },
    });

    // Nếu chưa có, tạo mới PatientBills
    if (!existingBill) {
      await db.patientBills.create({
        data: {
          bill_id: payment.id,
          service_id: services.id,
          service_date: new Date(),
          quantity: 1, // Cố định = 1
          unit_cost: services.price,
          total_cost: services.price, // 1 × services.price
        },
      });

      // Cập nhật tổng tiền payment
      const totalBills = await db.patientBills.aggregate({
        where: { bill_id: payment.id },
        _sum: { total_cost: true },
      });

      await db.payment.update({
        where: { id: payment.id },
        data: {
          total_amount: totalBills._sum.total_cost || 0,
        },
      });
    }
  } catch (error) {
    console.error("Create bill for completed lab test error:", error);
  }
}
