import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export interface AuditLogData {
  user_id: string;
  record_id: string;
  action: string;
  details?: string;
  model: string;
}

/**
 * Tạo audit log entry
 * @param data - Dữ liệu audit log
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    await db.auditLog.create({
      data: {
        user_id: data.user_id,
        record_id: data.record_id,
        action: data.action,
        details: data.details,
        model: data.model,
      },
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

/**
 * Tạo audit log với user ID từ session hiện tại
 * @param data - Dữ liệu audit log (không cần user_id)
 */
export async function createAuditLogWithCurrentUser(data: Omit<AuditLogData, 'user_id'>) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.warn("No user ID found for audit log");
      return;
    }

    await createAuditLog({
      ...data,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error creating audit log with current user:", error);
  }
}

/**
 * Lấy audit logs theo model và record_id
 * @param model - Tên model (ví dụ: "Patient", "Appointment")
 * @param record_id - ID của record
 */
export async function getAuditLogs(model: string, record_id: string) {
  try {
    return await db.auditLog.findMany({
      where: {
        model,
        record_id,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

/**
 * Lấy audit logs theo user_id
 * @param user_id - ID của user
 */
export async function getAuditLogsByUser(user_id: string) {
  try {
    return await db.auditLog.findMany({
      where: {
        user_id,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs by user:", error);
    return [];
  }
}

/**
 * Các action types phổ biến
 */
export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE", 
  DELETE: "DELETE",
  VIEW: "VIEW",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  PAYMENT: "PAYMENT",
  APPOINTMENT: "APPOINTMENT",
} as const;

/**
 * Các model names phổ biến
 */
export const AUDIT_MODELS = {
  PATIENT: "Patient",
  DOCTOR: "Doctor", 
  STAFF: "Staff",
  APPOINTMENT: "Appointment",
  MEDICAL_RECORD: "MedicalRecord",
  PAYMENT: "Payment",
  LAB_TEST: "LabTest",
  DIAGNOSIS: "Diagnosis",
  VITAL_SIGNS: "VitalSigns",
  NOTIFICATION: "Notification",
  LEAVE_REQUEST: "LeaveRequest",
} as const; 