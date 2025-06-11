import { getDoctorUpcomingAppointments } from "@/utils/services/doctor";
import { NotificationBellClient } from "./NotificationBellClient";

export async function NotificationBellWrapper() {
  const appointments = await getDoctorUpcomingAppointments();

  return <NotificationBellClient appointments={appointments} />;
}
