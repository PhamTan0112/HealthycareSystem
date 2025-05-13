import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ReviewForm } from "../dialogs/review-form";
import { checkRole } from "@/utils/roles";

const AppointmentQuickLinks = async ({ staffId }: { staffId: string }) => {
  const isPatient = await checkRole("PATIENT");
  return (
    <Card className="w-full rounded-xl bg-white shadow-none">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Link
          href="?cat=charts"
          className="px-4 py-2 rounded-lg bg-hray-100 text-gray-600"
        >
          Charts
        </Link>

        <Link
          href="?cat=appointtment"
          className="px-4 py-2 rounded-lg bg-hray-100 text-violet-600"
        >
          Appointtment
        </Link>

        <Link
          href="?cat=diagnosis"
          className="px-4 py-2 rounded-lg bg-hray-100 text-blue-600"
        >
          Diagnosis
        </Link>

        <Link
          href="?cat=billing"
          className="px-4 py-2 rounded-lg bg-hray-100 text-red-600"
        >
          Billing
        </Link>

        <Link
          href="?cat=medical-history"
          className="px-4 py-2 rounded-lg bg-hray-100 text-purple-600"
        >
          Medical History
        </Link>

        <Link
          href="?cat=payments"
          className="px-4 py-2 rounded-lg bg-hray-100 text-pink-600"
        >
          Payments
        </Link>

        <Link
          href="?cat=lab-test"
          className="px-4 py-2 rounded-lg bg-hray-100 text-amber-600"
        >
          Lab Test
        </Link>

        <Link
          href="?cat=vital-signs"
          className="px-4 py-2 rounded-lg bg-hray-100 text-sky-600"
        >
          Vital Signs
        </Link>
        {isPatient && <ReviewForm staffId={staffId} />}
      </CardContent>
    </Card>
  );
};
export default AppointmentQuickLinks;
