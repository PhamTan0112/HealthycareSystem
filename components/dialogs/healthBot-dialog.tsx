"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import { chatWithGeminiAction } from "@/app/actions/chatbot";
import { v4 as uuidv4 } from "uuid";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function HealthBotDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !sessionId) {
      setSessionId(uuidv4());
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chatWithGeminiAction({
        message: userMsg.content,
        sessionId: sessionId || undefined,
      });

      if (res.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.reply },
        ]);
        if (!sessionId) setSessionId(res.sessionId);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Lỗi kết nối đến server AI." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="rounded-full p-4 shadow-lg bg-primary text-white"
          >
            <Bot className="h-5 w-5" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>🤖 Trợ lý y tế thông minh</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md ${
                  msg.role === "user"
                    ? "bg-blue-100 text-right ml-auto"
                    : "bg-muted text-left mr-auto"
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <textarea
              className="flex-1 border rounded-md p-2 text-sm min-h-[60px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập triệu chứng hoặc tin nhắn..."
            />
            <Button disabled={isLoading} onClick={handleSend}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gửi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
