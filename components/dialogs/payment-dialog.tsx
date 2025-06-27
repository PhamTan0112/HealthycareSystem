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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createPaymentAction } from "@/app/actions/payment";
import { toast } from "sonner";
import { useState } from "react";
import { CreditCard, Wallet, Banknote, Receipt } from "lucide-react";

interface DialogPaymentProps {
  paymentId: number;
  totalAmount: number;
  discount: number;
  amountPaid: number;
}

export const DialogPayment = ({
  paymentId,
  totalAmount,
  discount,
  amountPaid,
}: DialogPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const payableAmount = totalAmount - discount;
  const remainingAmount = payableAmount - amountPaid;

  const handlePayment = async (method: string) => {
    setLoading(true);
    try {
      const checkoutUrl = await createPaymentAction(paymentId);
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
        setIsOpen(false);
        toast.success("Đang chuyển đến trang thanh toán...");
      } else {
        toast.error("Không thể tạo phiên thanh toán");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Có lỗi xảy ra khi thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Thanh toán
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Thanh toán hóa đơn #{paymentId}
          </DialogTitle>
          <DialogDescription>
            Chọn phương thức thanh toán phù hợp với bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thông tin hóa đơn */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Thông tin hóa đơn #{paymentId}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold">
                  {totalAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="text-green-600">
                  -{discount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              {amountPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="text-blue-600">
                    -{amountPaid.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Phải trả:</span>
                <span className="text-blue-600">
                  {remainingAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Phương thức thanh toán */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">
              Chọn phương thức thanh toán:
            </h3>

            <div className="grid gap-3">
              {/* Thanh toán trực tuyến */}
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handlePayment("online")}
                disabled={loading}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold">Thanh toán trực tuyến</div>
                    <div className="text-sm text-gray-600">
                      Thẻ tín dụng, chuyển khoản
                    </div>
                  </div>
                </div>
              </Button>

              {/* Thanh toán tại quầy */}
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handlePayment("counter")}
                disabled={loading}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">Thanh toán tại quầy</div>
                    <div className="text-sm text-gray-600">
                      Tiền mặt, thẻ ATM
                    </div>
                  </div>
                </div>
              </Button>

              {/* Ví điện tử */}
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handlePayment("ewallet")}
                disabled={loading}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-purple-600" />
                  <div className="text-left">
                    <div className="font-semibold">Ví điện tử</div>
                    <div className="text-sm text-gray-600">
                      Momo, ZaloPay, VNPay
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Lưu ý */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Lưu ý:</strong>
              <ul className="mt-1 space-y-1">
                <li>
                  • Hóa đơn sẽ được cập nhật sau khi thanh toán thành công
                </li>
                <li>• Bạn có thể tải hóa đơn sau khi hoàn tất thanh toán</li>
                <li>
                  • Liên hệ hỗ trợ nếu gặp vấn đề trong quá trình thanh toán
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
