import { getVitalSignData } from "@/utils/Services/medical";
import BloodPressureChart from "./blood-pressure-chart";

export default async function ChartContainer({ id }: { id: string }) {
  const { data, average, heartRateData, averageHeartRate } =
    await getVitalSignData(id.toString());
  return (
    <>
      <BloodPressureChart data={data} average={average} />
    </>
  );
}
