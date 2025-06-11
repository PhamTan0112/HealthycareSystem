"use client";

import { Bell } from "lucide-react";

interface Props {
  appointments: {
    id: number;
    appointment_date: Date;
    time: string;
    patient: {
      first_name: string;
      last_name: string;
    };
  }[];
}

export const NotificationBellClient = ({ appointments }: Props) => {
  return (
    <div className="relative group cursor-pointer">
      <Bell />
      {appointments.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white shadow-md rounded-md p-2 hidden group-hover:block z-50">
          {appointments.map((a) => (
            <div key={a.id} className="text-sm py-1 border-b">
              <p className="font-medium">
                {a.patient.first_name} {a.patient.last_name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(a.appointment_date).toLocaleString()} - {a.time}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
