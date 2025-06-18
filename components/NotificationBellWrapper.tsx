import { getUpcomingAppointmentsByRole } from "@/utils/services/doctor";
import { NotificationBellClient } from "./NotificationBellClient";

export async function NotificationBellWrapper() {
  const appointments = await getUpcomingAppointmentsByRole();

  return <NotificationBellClient appointments={appointments} />;
}
