import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoDataFound } from "../no-data-found";
import { AddDiagnosis } from "../dialogs/add-diagnosis";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { record } from "zod";
import { MedicalHistoryCard } from "./medical-history-card";
import { getAllServices } from "@/app/actions/medical";

export const DiagnosisContainer = async ({
  patientId,
  doctorId,
  id,
}: {
  patientId: string;
  doctorId: string;
  id: string;
}) => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");
  
  const isPatient = await checkRole("PATIENT");
  
  // Tao dieu kien where cho medical records
  let whereCondition: any = { appointment_id: Number(id) };
  
  // Neu la patient, chi lay chan doan cua chinh minh
  if (isPatient) {
    whereCondition.patient_id = userId;
  }
  
  const services = await getAllServices();
  const data = await db.medicalRecords.findFirst({
    where: whereCondition,
    include: {
      diagnosis: {
        include: { doctor: true },
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });
  const diagnosis = data?.diagnosis || null;

  return (
    <div>
      {diagnosis?.length === 0 || !diagnosis ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <NoDataFound note="No diagnosis found" />
          {!isPatient && (
            <AddDiagnosis
              key={new Date().getTime()}
              patientId={patientId}
              doctorId={doctorId}
              appointmentId={id}
              services={services}
              medicalId={String(data?.id)}
            />
          )}
        </div>
      ) : (
        <section className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ho so y te</CardTitle>

              {!isPatient && (
                <AddDiagnosis
                  key={new Date().getTime()}
                  patientId={patientId}
                  doctorId={doctorId}
                  appointmentId={id}
                  services={services}
                  medicalId={String(data?.id)}
                />
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {diagnosis?.map((record, id) => (
                <div key={record.id}>
                  <MedicalHistoryCard record={record} index={id} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};
