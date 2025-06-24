import { Diagnosis, Doctor } from "@prisma/client";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

interface ExtendedMedicalRecord extends Diagnosis {
  doctor: Doctor;
}

export const MedicalHistoryCard = ({
  record,
  index,
}: {
  record: ExtendedMedicalRecord;
  index: number;
}) => {
  return (
    <Card className="shadow-none">
      <div className="space-y-6 pt-4">
        <div className="flex gap-x-6 justify-between">
          <div>
            <span className="text-sm text-gray-500">Mã cuộc hẹn</span>
            <p className="text-xl font-medium"># {record.id}</p>
          </div>

          {index === 0 && (
            <div className="px-4 h-8 text-center bg-blue-100 rounded-full font-semibold text-blue-600">
              <span>Mới nhất</span>
            </div>
          )}

          <div>
            <span className="text-sm text-gray-500">Ngày</span>
            <p className="text-xl font-medium">
              {record.created_at.toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Chẩn đoán</span>
          <p className="text-lg text-muted-foreground">{record.diagnosis}</p>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Triệu chứng</span>
          <p className="text-lg text-muted-foreground">{record.symptoms}</p>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Ghi chú thêm</span>
          <p className="text-lg text-muted-foreground">{record.notes}</p>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Bác sĩ</span>
          <div>
            <p className="text-lg text-muted-foreground">
              {record.doctor.name}
            </p>
            <span>{record.doctor.specialization}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
