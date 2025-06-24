"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import { createPaymentAction } from "@/app/actions/payment";
import { toast } from "sonner";

interface DialogPaymentProps {
  paymentId: number;
}

export const DialogPayment = ({ paymentId }: DialogPaymentProps) => {
  const [isPending, startTransition] = useTransition();

  if (!paymentId) {
    console.error("DialogPayment: paymentId is missing!");
    return null;
  }

  const handlePayment = () => {
    startTransition(async () => {
      try {
        const url = await createPaymentAction(paymentId);
        toast.success("Đang chuyển sang cổng thanh toán PayOS...");
        window.location.href = url;
      } catch (error) {
        console.error("Lỗi khi tạo thanh toán:", error);
        toast.error("Không thể tạo thanh toán. Vui lòng thử lại.");
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-blue-600 hover:text-blue-800"
          title="Thanh toán"
        >
          <CreditCard size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm p-4 space-y-3 text-sm">
        <DialogTitle>Xác nhận thanh toán</DialogTitle>
        <p className="text-muted-foreground">
          Bạn sẽ được chuyển sang cổng thanh toán PayOS để hoàn tất giao dịch.
        </p>

        <Button
          onClick={handlePayment}
          disabled={isPending}
          className="w-full"
          size="sm"
        >
          {isPending ? "Đang xử lý..." : "Tiếp tục đến PayOS"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
