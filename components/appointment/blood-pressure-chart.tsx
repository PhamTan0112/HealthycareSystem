"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface BloodPressureChartProps {
  average: string;
  data: {
    label: string;
    systolic: number;
    diastolic: number;
  }[];
}

const BloodPressureChart = ({ data, average }: BloodPressureChartProps) => {
  const lastData = data[data.length - 1];
  const router = useRouter();
  return (
    <Card className="shadow-none col-span-2">
      <CardHeader>
        <CardTitle>Huyết áp</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-lg xl:text-xl font-semibold">
              {lastData?.systolic || 0}/{lastData?.diastolic || 0} mmHg
            </p>
            <p className="text-sm text-muted-foreground">Gần nhất</p>
          </div>

          <div>
            <p className="text-lg xl:text-xl font-semibold">{average}</p>
            <p className="text-sm text-muted-foreground">Trung bình 7 ngày</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("?cat=appointments")}
          >
            Chi tiết
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ddd"
            />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tick={{ fill: "#9ca3af" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: "10px", borderColor: "#fff" }}
            />
            <Legend
              align="left"
              verticalAlign="top"
              wrapperStyle={{
                paddingTop: "20px",
                paddingBottom: "40px",
                textTransform: "capitalize",
              }}
            />
            <Bar
              dataKey="systolic"
              fill="#000000"
              legendType="circle"
              radius={[10, 10, 0, 0]}
              name="Tâm thu"
            />
            <Bar
              dataKey="diastolic"
              fill="#2563eb"
              legendType="circle"
              radius={[10, 10, 0, 0]}
              name="Tâm trương"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BloodPressureChart;
