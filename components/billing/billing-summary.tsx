import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

interface BillingSummaryProps {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
}

export const BillingSummary = ({
  totalBills,
  paidBills,
  unpaidBills,
  totalAmount,
  totalPaid,
  totalUnpaid,
}: BillingSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Tổng số hóa đơn */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBills}</div>
          <p className="text-xs text-muted-foreground">
            Tất cả hóa đơn
          </p>
        </CardContent>
      </Card>

      {/* Hóa đơn đã thanh toán */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{paidBills}</div>
          <p className="text-xs text-muted-foreground">
            {totalPaid.toLocaleString('vi-VN')}₫
          </p>
        </CardContent>
      </Card>

      {/* Hóa đơn chưa thanh toán */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{unpaidBills}</div>
          <p className="text-xs text-muted-foreground">
            {totalUnpaid.toLocaleString('vi-VN')}₫
          </p>
        </CardContent>
      </Card>

      {/* Tổng tiền */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng tiền</CardTitle>
          <CreditCard className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalAmount.toLocaleString('vi-VN')}₫
          </div>
          <p className="text-xs text-muted-foreground">
            Tổng giá trị
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 