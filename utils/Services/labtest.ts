// utils/Services/labtest.ts

import db from "@/lib/db";

export async function getAllLabTests({
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

    const [labTests, totalRecords] = await Promise.all([
      db.labTest.findMany({
        where: {
          OR: [
            { result: { contains: search, mode: "insensitive" } },
            {
              medical_record: {
                patient: {
                  OR: [
                    { first_name: { contains: search, mode: "insensitive" } },
                    { last_name: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        },
        include: {
          services: true,
          medical_record: {
            include: { patient: true },
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { test_date: "desc" },
      }),
      db.labTest.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: labTests,
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
