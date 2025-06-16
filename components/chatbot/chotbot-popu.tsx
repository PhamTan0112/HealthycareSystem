"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ChatbotPopup() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();

  const handleSend = async () => {
    if (!input.trim() || !user?.id) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          user_id: user.id, // 👈 truyền userId từ Clerk
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Đã xảy ra lỗi khi kết nối với trợ lý AI.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-xl w-14 h-14 p-0 text-xl z-50"
      >
        💬
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Trợ lý AI</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-md border bg-muted mb-2">
            <ScrollArea className="h-[300px] px-2 py-2">
              <div className="space-y-2 pr-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "text-right text-blue-600"
                        : "text-left text-gray-800"
                    }
                  >
                    <span className="block whitespace-pre-wrap">
                      {m.content}
                    </span>
                  </div>
                ))}
                {isThinking && (
                  <div className="text-gray-500 italic text-sm">
                    Trợ lý đang soạn phản hồi...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} size="icon" disabled={isThinking}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
