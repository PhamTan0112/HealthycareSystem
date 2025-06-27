"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Eye, Download, Receipt, Calendar, User, Phone } from "lucide-react";
import { toast } from "sonner";

interface BillDetailsDialogProps {
  paymentId: number;
  patientName: string;
  patientPhone: string;
  billDate: string;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  status: string;
  services?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export const BillDetailsDialog = ({
  paymentId,
  patientName,
  patientPhone,
  billDate,
  totalAmount,
  discount,
  amountPaid,
  status,
  services = []
}: BillDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const payableAmount = totalAmount - discount;
  const remainingAmount = payableAmount - amountPaid;

  const handleDownload = () => {
    // Logic tải hóa đơn PDF
    toast.success("Đang tải hóa đơn...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Xem chi tiết hóa đơn"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Chi tiết hóa đơn #{paymentId}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về hóa đơn và các dịch vụ đã sử dụng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin bệnh nhân */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Họ tên:</span>
                <span className="font-semibold">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="font-semibold">{patientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày lập hóa đơn:</span>
                <span className="font-semibold">{billDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Chi tiết dịch vụ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Chi tiết dịch vụ</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">
                          {service.quantity} x {service.unitPrice.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <div className="font-semibold">
                        {service.total.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Không có chi tiết dịch vụ
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tổng kết thanh toán */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tổng kết thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                <span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="text-green-600">-{discount.toLocaleString('vi-VN')}₫</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Phải trả:</span>
                <span className="text-blue-600">{payableAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã thanh toán:</span>
                <span className="font-semibold text-green-600">{amountPaid.toLocaleString('vi-VN')}₫</span>
              </div>
              {remainingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Còn nợ:</span>
                  <span className="font-semibold text-red-600">{remainingAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trạng thái hóa đơn */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Trạng thái:</div>
                  <Badge 
                    variant={status === "PAID" ? "default" : "secondary"}
                    className={status === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                  >
                    {status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Badge>
                </div>
                {status === "PAID" && (
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Tải hóa đơn
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 