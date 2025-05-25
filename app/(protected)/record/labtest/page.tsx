import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabTestForm } from "@/components/forms/labtest-form";

export default async function LabTestPage() {
  const { userId } = await auth();

  if (!userId) return notFound();

  const labTests = await db.labTest.findMany({
    include: {
      services: true,
    },
    orderBy: { test_date: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Xét nghiệm</h1>

      {/* Form nhập mới */}
      <Card>
        <CardHeader>
          <CardTitle>Thêm xét nghiệm mới</CardTitle>
        </CardHeader>
        <CardContent>
          <LabTestForm />
        </CardContent>
      </Card>

      {/* Danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                #{test.id}
                <Badge
                  variant={
                    test.status === "completed"
                      ? "default" // hoặc "secondary" nếu bạn muốn màu nhẹ
                      : test.status === "pending"
                      ? "outline"
                      : test.status === "cancelled"
                      ? "destructive"
                      : "secondary" // fallback
                  }
                >
                  {test.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Ngày:</strong>{" "}
                {new Date(test.test_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Kết quả:</strong> {test.result}
              </p>
              <p>
                <strong>Dịch vụ:</strong> {test.services?.service_name}
              </p>
              <p>
                <strong>Ghi chú:</strong> {test.notes || "Không có"}
              </p>
              {/* Có thể gắn thêm nút cập nhật form */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
