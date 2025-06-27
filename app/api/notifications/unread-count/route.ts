import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUnreadNotificationCount } from "@/app/actions/notification";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getUnreadNotificationCount(userId);
    
    if (result.success) {
      return NextResponse.json({ success: true, count: result.count });
    } else {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Get unread count error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 