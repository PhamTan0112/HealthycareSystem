import db from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getPaymentRecords({
  page,
  limit,
  search,
  patientId,
  userRole,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
  patientId?: string;
  userRole?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    // Base search conditions
    const searchConditions: Prisma.PaymentWhereInput = search ? {
      OR: [
        {
          patient: {
            first_name: { contains: search, mode: "insensitive" },
          },
        },
        {
          patient: {
            last_name: { contains: search, mode: "insensitive" },
          },
        },
        { patient_id: { contains: search, mode: "insensitive" } },
      ],
    } : {};

    // Add patient ID filter if user is not admin or doctor
    let where: Prisma.PaymentWhereInput = searchConditions;
    
    if (patientId && userRole && !["admin", "doctor"].includes(userRole.toLowerCase())) {
      where = {
        ...searchConditions,
        patient_id: patientId,
      };
    }

    const [data, totalRecords] = await Promise.all([
      db.payment.findMany({
        where: where,
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              date_of_birth: true,
              img: true,
              colorCode: true,
              gender: true,
              phone: true,
            },
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { created_at: "desc" },
      }),
      db.payment.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data,
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
