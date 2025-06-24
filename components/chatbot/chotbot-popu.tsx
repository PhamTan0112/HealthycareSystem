"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ChatbotMessenger() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "💖 Xin chào! Mình có thể hỗ trợ gì cho bạn hôm nay?",
    },
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
          user_id: user.id,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.",
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
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full p-0 shadow-lg text-2xl bg-pink-600 hover:bg-pink-700 text-white"
      >
        {open ? <X className="w-5 h-5" /> : "💬"}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[370px] max-w-[92vw] h-[500px] bg-white rounded-xl shadow-2xl border border-pink-200 flex flex-col z-40">
          <div className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-t-xl flex items-center justify-between">
            <span>Trợ lý Sức Khỏe AI</span>
            <X
              className="w-4 h-4 cursor-pointer hover:opacity-80"
              onClick={() => setOpen(false)}
            />
          </div>

          <ScrollArea className="flex-1 p-3 overflow-y-auto bg-pink-50">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-pink-500 text-white"
                      : "mr-auto bg-white text-gray-800 border border-pink-200"
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {isThinking && (
                <div className="text-pink-500 italic text-sm animate-pulse">
                  Trợ lý đang trả lời...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="border-t bg-white p-3 flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="resize-none rounded-lg text-sm p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-pink-500 hover:bg-pink-600 text-white"
              disabled={isThinking}
            >
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
