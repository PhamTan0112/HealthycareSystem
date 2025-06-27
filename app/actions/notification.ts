"use server";

import db from "@/lib/db";
import { NotificationType, NotificationPriority } from "@prisma/client";

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  relatedId?: string;
  relatedType?: string;
  scheduledAt?: Date;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await db.notification.create({
      data: {
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || "MEDIUM",
        related_id: data.relatedId,
        related_type: data.relatedType,
        scheduled_at: data.scheduledAt,
      },
    });

    return { success: true, data: notification };
  } catch (error) {
    console.error("Create notification error:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

// Thông báo khi đặt lịch hẹn
export async function sendAppointmentNotification(
  patientId: string,
  doctorId: string,
  appointmentId: number,
  appointmentDate: Date,
  time: string
) {
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    select: { first_name: true, last_name: true },
  });

  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    select: { name: true },
  });

  if (!patient || !doctor) {
    return { success: false, error: "User not found" };
  }

  // Thông báo cho bệnh nhân
  await createNotification({
    userId: patientId,
    title: "Lịch hẹn mới",
    message: `Lịch hẹn với bác sĩ ${doctor.name} vào ${appointmentDate.toLocaleDateString("vi-VN")} lúc ${time} đã được đặt thành công.`,
    type: "APPOINTMENT",
    priority: "MEDIUM",
    relatedId: appointmentId.toString(),
    relatedType: "appointment",
  });

  // Thông báo cho bác sĩ
  await createNotification({
    userId: doctorId,
    title: "Lịch hẹn mới",
    message: `Bệnh nhân ${patient.first_name} ${patient.last_name} đã đặt lịch hẹn vào ${appointmentDate.toLocaleDateString("vi-VN")} lúc ${time}.`,
    type: "APPOINTMENT",
    priority: "MEDIUM",
    relatedId: appointmentId.toString(),
    relatedType: "appointment",
  });

  return { success: true };
}

// Thông báo khi có kết quả xét nghiệm
export async function sendLabResultNotification(
  patientId: string,
  labTestId: number,
  testName: string
) {
  await createNotification({
    userId: patientId,
    title: "Kết quả xét nghiệm",
    message: `Kết quả xét nghiệm ${testName} đã có sẵn. Vui lòng kiểm tra trong hồ sơ bệnh án.`,
    type: "LAB_RESULT",
    priority: "HIGH",
    relatedId: labTestId.toString(),
    relatedType: "labtest",
  });

  return { success: true };
}

// Thông báo thanh toán
export async function sendPaymentNotification(
  patientId: string,
  paymentId: number,
  amount: number,
  status: string
) {
  const statusText = status === "PAID" ? "thành công" : "chưa hoàn tất";
  
  await createNotification({
    userId: patientId,
    title: "Thông báo thanh toán",
    message: `Thanh toán hóa đơn #${paymentId} với số tiền ${amount.toLocaleString("vi-VN")}₫ đã ${statusText}.`,
    type: "PAYMENT",
    priority: status === "PAID" ? "LOW" : "HIGH",
    relatedId: paymentId.toString(),
    relatedType: "payment",
  });

  return { success: true };
}

// Thông báo nhắc lịch hẹn (scheduled)
export async function sendAppointmentReminderNotification(
  patientId: string,
  appointmentId: number,
  appointmentDate: Date,
  time: string,
  doctorName: string
) {
  await createNotification({
    userId: patientId,
    title: "Nhắc lịch hẹn",
    message: `Lịch hẹn với bác sĩ ${doctorName} vào ${appointmentDate.toLocaleDateString("vi-VN")} lúc ${time} sẽ diễn ra trong 24 giờ tới.`,
    type: "REMINDER",
    priority: "HIGH",
    relatedId: appointmentId.toString(),
    relatedType: "appointment",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 giờ trước
  });

  return { success: true };
}

// Lấy thông báo cho user
export async function getUserNotifications(userId: string, limit = 10) {
  try {
    const notifications = await db.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { success: false, error: "Failed to get notifications" };
  }
}

// Đánh dấu thông báo đã đọc
export async function markNotificationAsRead(notificationId: number) {
  try {
    await db.notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

// Đánh dấu tất cả thông báo đã đọc
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

// Đếm số thông báo chưa đọc
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await db.notification.count({
      where: { user_id: userId, is_read: false },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Get unread count error:", error);
    return { success: false, error: "Failed to get unread count" };
  }
} 