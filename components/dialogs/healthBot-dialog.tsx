"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";

export function HealthBotDialog() {
  const [open, setOpen] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Lỗi kết nối tới AI server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-4 right-4 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full p-4 shadow-xl" size="icon">
              <Bot className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>🤖 Chatbot Tư Vấn Sức Khỏe</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Nhập mô tả triệu chứng của bạn..."
                className="w-full min-h-[80px] p-2 border rounded-md"
              />

              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Gửi cho AI
              </Button>

              {result && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  {result.error ? (
                    <p className="text-red-500">{result.error}</p>
                  ) : (
                    <>
                      <p>
                        <strong>Chẩn đoán:</strong> {result.prediction}
                      </p>
                      <p>
                        <strong>Độ tin cậy:</strong> {result.confidence}
                      </p>

                      {result.top_predictions?.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">🔎 Các khả năng khác:</p>
                          <ul className="list-disc pl-5">
                            {result.top_predictions.map(
                              (item: any, i: number) => (
                                <li key={i}>
                                  {item.disease} ({item.confidence})
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {result.precautions?.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">🩺 Lời khuyên:</p>
                          <ul className="list-disc pl-5">
                            {result.precautions.map((p: string, i: number) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
