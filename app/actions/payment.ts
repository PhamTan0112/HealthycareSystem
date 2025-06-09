"use server";

import db from "@/lib/db";
import crypto from "crypto";

function createSignature(
  data: Record<string, any>,
  checksumKey: string
): string {
  const sortedKeys = Object.keys(data).sort();
  const rawData = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");
  return crypto.createHmac("sha256", checksumKey).update(rawData).digest("hex");
}

// Hàm gọi PayOS API trực tiếp trong cùng file (đã tích hợp tạo chữ ký)
async function createPayOSPaymentUrl({
  orderCode,
  amount,
  description,
  returnUrl,
  cancelUrl,
}: {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const payload = {
    orderCode,
    amount: Math.round(amount), // đảm bảo số nguyên
    description,
    returnUrl,
    cancelUrl,
  };

  const signature = createSignature(payload, process.env.PAYOS_CHECKSUM_KEY!);

  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": process.env.PAYOS_CLIENT_ID!,
      "x-api-key": process.env.PAYOS_API_KEY!,
    },
    body: JSON.stringify({
      ...payload,
      signature,
    }),
  });

  const data = await res.json();
  console.log("✅ PayOS response:", data);

  if (data.code !== "00" || !data.data?.checkoutUrl) {
    throw new Error(data?.desc || "Tạo thanh toán PayOS thất bại.");
  }
  console.log("check url: ", data);
  return data.data.checkoutUrl as string;
}

// Server action khởi tạo thanh toán
export async function createPaymentAction(paymentId: number) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) throw new Error("Không tìm thấy hóa đơn");

  const orderCode = payment.receipt_number || Date.now(); // fallback nếu chưa có

  const checkoutUrl = await createPayOSPaymentUrl({
    orderCode,
    amount: payment.total_amount,
    description: `Hóa đơn #${paymentId}`,
    returnUrl: `http://localhost:3000/record/billing?receipt_number=${orderCode}`,
    cancelUrl: `http://localhost:3000/record/billing`,
  });

  return checkoutUrl;
}

export async function updatePaymentStatus({
  receiptNumber,
  status = "PAID",
}: {
  receiptNumber: number;
  status?: "PAID" | "UNPAID";
}) {
  const payment = await db.payment.findFirst({
    where: { receipt_number: receiptNumber },
  });

  if (!payment) {
    throw new Error("Không tìm thấy hóa đơn tương ứng");
  }

  if (payment.status === status) {
    return { message: "Trạng thái đã cập nhật trước đó" };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status,
      payment_date: new Date(),
    },
  });

  return { message: "Cập nhật trạng thái thành công" };
}
