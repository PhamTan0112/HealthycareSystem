import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const body = await req.json();
    const { leave_type, start_date, end_date, reason } = body;
    if (!leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }
    await db.leaveRequest.create({
      data: {
        doctor_id: userId,
        leave_type,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        reason,
        status: "PENDING",
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
} 