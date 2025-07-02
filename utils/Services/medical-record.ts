import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";

export async function getMedicalRecords({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const { userId } = await auth();
    const isPatient = await checkRole("PATIENT");
    
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    // Base search conditions
    const searchConditions: Prisma.MedicalRecordsWhereInput = search ? {
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

    // Add patient filter if user is a patient
    let where: Prisma.MedicalRecordsWhereInput = searchConditions;
    
    if (isPatient && userId) {
      where = {
        ...searchConditions,
        patient_id: userId,
      };
    }

    const [data, totalRecords] = await Promise.all([
      db.medicalRecords.findMany({
        where: where,
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              date_of_birth: true,
              email: true,
              img: true,
              colorCode: true,
              gender: true,
            },
          },

          diagnosis: {
            include: {
              doctor: {
                select: {
                  name: true,
                  specialization: true,
                  img: true,
                  colorCode: true,
                },
              },
            },
          },
          lab_test: true,
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { created_at: "desc" },
      }),
      db.medicalRecords.count({
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
