import { analyzePatientData } from "@/app/actions/analyzePatient";
import { getActiveDoctorsToday } from "@/utils/services/doctor";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const user_id = params?.user_id;

    if (!user_id) {
      return NextResponse.json(
        { error: "Thiếu user_id trong URL." },
        { status: 400 }
      );
    }

    // Phân tích hồ sơ bệnh nhân
    const patientSummary = await analyzePatientData(user_id);
    // Lấy danh sách bác sĩ đang làm việc hôm nay
    const doctorsToday = await getActiveDoctorsToday();
    return NextResponse.json({
      ...patientSummary,
      active_doctors: doctorsToday, // ✅ thêm vào response
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Phân tích không thành công", details: String(error) },
      { status: 500 }
    );
  }
}
