import { NextResponse } from "next/server";
import { sendAppointmentReminderEmails } from "../../app/actions/appointment";

export async function GET() {
  await sendAppointmentReminderEmails();
  return NextResponse.json({ success: true });
}
