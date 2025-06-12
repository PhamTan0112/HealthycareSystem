"use client";

import { Bell } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  appointments: {
    id: number;
    appointment_date: Date;
    time: string;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "PENDING";
    patient: {
      first_name: string;
      last_name: string;
    };
  }[];
}

const statusColorMap: Record<string, string> = {
  SCHEDULED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

export const NotificationBellClient = ({ appointments }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="text-gray-500" />
          {appointments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {appointments.length}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2 translate-x-[-20px] bg-gray-50 shadow-md rounded-md">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">
          Lịch hẹn gần nhất
        </h4>
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-400">Không có lịch hẹn</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {appointments.map((a) => (
              <Card key={a.id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-700">
                      {a.patient.first_name} {a.patient.last_name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColorMap[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {a.appointment_date.toLocaleDateString()} - {a.time}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
