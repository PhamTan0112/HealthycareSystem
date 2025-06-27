import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { markAllNotificationsAsRead } from "@/app/actions/notification";

export async function PUT() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await markAllNotificationsAsRead(userId);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 