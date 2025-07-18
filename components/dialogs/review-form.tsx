"use client";

import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus, StarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { createReview } from "@/app/actions/general";
import { reviewSchema, ReviewFormValues } from "@/lib/schema";

export const ReviewForm = ({ staffId }: { staffId: string }) => {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      patient_id: userId ?? "",
      staff_id: staffId,
      rating: 1,
      comment: "",
    },
  });

  const handleSubmit = async (values: ReviewFormValues) => {
    setLoading(true);
    try {
      const response = await createReview(values);
      if (response.success) {
        toast.success("Đánh giá đã được gửi!");
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Không thể gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;
  if (!userId) {
    toast.error("Bạn cần đăng nhập để đánh giá.");
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="px-4 py-2 rounded-lg bg-black/10 text-black hover:bg-transparent font-light"
        >
          <Plus /> Viết đánh giá
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gửi đánh giá của bạn</DialogTitle>
          <DialogDescription>
            Hãy chia sẻ trải nghiệm của bạn với bác sĩ hoặc nhân viên y tế.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn số sao</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                        >
                          <StarIcon
                            size={30}
                            className={cn(
                              star <= field.value
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-400"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Đánh giá dựa trên trải nghiệm của bạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhận xét</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Viết đánh giá chi tiết tại đây..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ghi nhận xét cụ thể để tham khảo thêm.
                  </FormDescription>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading || !userId}
              className="w-full"
            >
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
