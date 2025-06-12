import { Resend } from "resend";

export function formatNumber(amount: number): string {
  return amount?.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export function getInitials(name: string): string {
  const words = name.trim().split(" ");

  const firstTwoWords = words.slice(0, 2);

  const initials = firstTwoWords.map((word) => word.charAt(0).toUpperCase());

  return initials.join("");
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    // timeZoneName: "short", // "UTC"
  };

  return date.toLocaleString("en-US", options);
}

export function calculateAge(dob: Date): string {
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (months === 0 && today.getDate() < dob.getDate()) {
    years--;
    months = 11;
  }

  if (years === 0) {
    return `${months} months old`;
  }

  let ageString = `${years} years`;

  if (months > 0) {
    ageString += ` ${months} months`;
  }

  return ageString + " old";
}

export const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function generateRandomColor(): string {
  let hexColor = "";
  do {
    const randomInt = Math.floor(Math.random() * 16777216);

    hexColor = `#${randomInt.toString(16).padStart(6, "0")}`;
  } while (
    hexColor.toLowerCase() === "#ffffff" ||
    hexColor.toLowerCase() === "#000000"
  ); // Ensure it’s not white or black
  return hexColor;
}

function formatTime(hour: number, minute: number): string {
  const hourStr = hour.toString().padStart(2, "0");
  const minuteStr = minute.toString().padStart(2, "0");
  return `${hourStr}:${minuteStr}`; // ví dụ: "14:30"
}

export function generateTimes(
  start_hour: number,
  close_hour: number,
  interval_in_minutes: number
) {
  const times = [];
  const startHour = start_hour;
  const endHour = close_hour;
  const intervalMinutes = interval_in_minutes;

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break;
      const formattedTime = formatTime(hour, minute);
      times.push({ label: formattedTime, value: formattedTime });
    }
  }

  return times;
}

export const calculateBMI = (weight: number, height: number) => {
  const heightInMeters = height / 100;

  const bmi = weight / (heightInMeters * heightInMeters);

  let status: string;
  let colorCode: string;

  if (bmi < 18.5) {
    status = "Underweight";
    colorCode = "#1E90FF";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    status = "Normal";
    colorCode = "#1E90FF";
  } else if (bmi >= 25 && bmi <= 29.9) {
    status = "Overweight";
    colorCode = "#FF9800";
  } else {
    status = "Obesity";
    colorCode = "#FF5722";
  }

  return {
    bmi: parseFloat(bmi.toFixed(2)),
    status,
    colorCode,
  };
};

type DiscountInput = {
  amount: number;
  discount?: number;
  discountPercentage?: number;
};

export function calculateDiscount({
  amount,
  discount,
  discountPercentage,
}: DiscountInput): {
  finalAmount: number;
  discountPercentage?: number;
  discountAmount?: number;
} {
  if (discount != null && discountPercentage != null) {
    throw new Error(
      "Provide either discount amount or discount percentage, not both."
    );
  }

  if (discount != null) {
    // Calculate discount percentage if a discount amount is provided
    const discountPercent = (discount / amount) * 100;
    return {
      finalAmount: amount - discount,
      discountPercentage: discountPercent,
      discountAmount: discount,
    };
  } else if (discountPercentage != null) {
    // Calculate discount amount if a discount percentage is provided
    const discountAmount = (discountPercentage / 100) * amount;
    return {
      finalAmount: amount - discountAmount,
      discountPercentage,
      discountAmount,
    };
  } else {
    throw new Error(
      "Please provide either a discount amount or a discount percentage."
    );
  }
}

export function generateConflictTimeSlots(time: string): string[] {
  const [hourStr, minStr] = time.split(":");
  const hour = parseInt(hourStr);
  const minute = parseInt(minStr);

  const format = (h: number, m: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  const slots = [];
  slots.push(format(hour, minute)); // chính giờ
  if (minute === 0) slots.push(format(hour - 1, 30)); // trước đó 30p
  if (minute === 30) slots.push(format(hour, 0)); // trước đó 30p

  return slots;
}

// const resend = new Resend("re_asWTh6PN_AQu3UFHG4TvsPWajn6Lttwp8");
// export async function sendAppointmentStatusEmail({
//   to,
//   patientName,
//   doctorName,
//   status,
//   appointmentDate,
//   time,
// }: {
//   to: string;
//   patientName: string;
//   doctorName: string;
//   status: "SCHEDULED" | "COMPLETED";
//   appointmentDate: string;
//   time: string;
// }) {
//   const statusText =
//     status === "SCHEDULED" ? "đã được lên lịch" : "đã được hoàn tất";

//   const subject =
//     status === "SCHEDULED"
//       ? "Lịch hẹn của bạn đã được lên lịch"
//       : "Lịch hẹn của bạn đã hoàn tất";

//   const html = `
//     <p>Xin chào <strong>${patientName}</strong>,</p>
//     <p>Lịch hẹn với bác sĩ <strong>${doctorName}</strong> vào <strong>${appointmentDate} lúc ${time}</strong> ${statusText}.</p>
//     <p>Trân trọng,<br/>HealthyCare Team</p>
//   `;

//   await resend.emails.send({
//     from: "noreply@healthycare.app",
//     to,
//     subject,
//     html,
//   });
// }
