import db from "@/lib/db";
import { getMonth, format, startOfYear, endOfMonth, isToday } from "date-fns";

type AppointmentStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface Appointment {
  status: AppointmentStatus;
  appointment_date: Date;
}

function isValidStatus(status: string): status is AppointmentStatus {
  return ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].includes(status);
}

const initializeMonthlyData = () => {
  const this_year = new Date().getFullYear();

  const months = Array.from(
    { length: getMonth(new Date()) + 1 },
    (_, index) => ({
      name: format(new Date(this_year, index), "MMM"),
      appointment: 0,
      completed: 0,
    })
  );
  return months;
};

export const processAppointments = async (appointments: Appointment[]) => {
  const monthlyData = initializeMonthlyData();

  const appointmentCounts = appointments.reduce<
    Record<AppointmentStatus, number>
  >(
    (acc, appointment) => {
      const status = appointment.status;

      const appointmentDate = appointment?.appointment_date;

      const monthIndex = getMonth(appointmentDate);

      if (
        appointmentDate >= startOfYear(new Date()) &&
        appointmentDate <= endOfMonth(new Date())
      ) {
        monthlyData[monthIndex].appointment += 1;

        if (status === "COMPLETED") {
          monthlyData[monthIndex].completed += 1;
        }
      }

      // Grouping by status
      if (isValidStatus(status)) {
        acc[status] = (acc[status] || 0) + 1;
      }

      return acc;
    },
    {
      PENDING: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
  );

  return { appointmentCounts, monthlyData };
};

export async function getPatientDashboardStatistics(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        message: "No data found",
        data: null,
      };
    }

    // Lấy thông tin bệnh nhân
    const data = await db.patient.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        gender: true,
        img: true,
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Patient data not found!",
        data: null,
        status: 200,
      };
    }

    // Lấy lịch sử cuộc hẹn của bệnh nhân
    const appointments = await db.appointment.findMany({
      where: { patient_id: data.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            img: true,
            specialization: true,
          },
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            gender: true,
            date_of_birth: true,
            img: true,
          },
        },
      },
      orderBy: { appointment_date: "desc" },
    });

    // Xử lý thống kê và lịch sử gần nhất
    const { appointmentCounts, monthlyData } = await processAppointments(
      appointments
    );
    const lastRecords = appointments.slice(0, 5);

    // Lấy ngày hôm nay (ví dụ "Friday")
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Lấy danh sách bác sĩ đang làm việc hôm nay
    const availableDoctorRaw = await db.doctor.findMany({
      where: {
        working_days: {
          some: { day: { equals: today, mode: "insensitive" } },
        },
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        img: true,
        working_days: true,
      },
    });

    // Không xử lý availableTimeSlots nữa — chỉ lấy bác sĩ đang làm hôm nay
    const availableDoctor = availableDoctorRaw.map((doc) => ({
      id: doc.id,
      name: doc.name,
      specialization: doc.specialization,
      img: doc.img,
      working_days: doc.working_days,
    }));

    // Trả kết quả
    return {
      success: true,
      data,
      appointmentCounts,
      lastRecords,
      totalAppointments: appointments.length,
      availableDoctor,
      monthlyData,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server ERROR", status: 500 };
  }
}
export async function getPatientById(id: string) {
  try {
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient data not found",
        status: 200,
        data: null,
      };
    }

    return { success: true, data: patient, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server ERROR", status: 500 };
  }
}

export async function getPatientFullDataById(id: string) {
  try {
    const patient = await db.patient.findFirst({
      where: {
        OR: [
          {
            id,
          },
          { email: id },
        ],
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
        appointments: {
          select: {
            appointment_date: true,
          },
          orderBy: {
            appointment_date: "desc",
          },
          take: 1,
        },
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient data not found",
        status: 404,
      };
    }
    const lastVisit = patient.appointments[0]?.appointment_date || null;

    return {
      success: true,
      data: {
        ...patient,
        totalAppointments: patient._count.appointments,
        lastVisit,
      },
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getAllPatients({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const [patients, totalRecords] = await Promise.all([
      db.patient.findMany({
        where: {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          appointments: {
            select: {
              medical: {
                select: { created_at: true, treatment_plan: true },
                orderBy: { created_at: "desc" },
                take: 1,
              },
            },
            orderBy: { appointment_date: "desc" },
            take: 1,
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { first_name: "asc" },
      }),
      db.patient.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: patients,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}
