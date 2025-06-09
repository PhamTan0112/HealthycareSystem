"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { v4 as uuidv4 } from "uuid";

const provider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Session RAM tạm (thay bằng Redis nếu cần)
const sessionStore = new Map<
  string,
  {
    messages: {
      role: "user" | "assistant" | "system" | "data";
      content: string;
    }[];
    lastUsed: number;
  }
>();

export async function chatWithGeminiAction({
  message,
  sessionId,
}: {
  message: string;
  sessionId?: string;
}) {
  const sid = sessionId || uuidv4();
  const session = sessionStore.get(sid) || {
    messages: [],
    lastUsed: Date.now(),
  };

  // Cập nhật session
  session.messages.push({ role: "user", content: message });

  const result = await streamText({
    model: provider("gemini-pro"),
    messages: [
      {
        role: "system",
        content: "Bạn là trợ lý sức khỏe thân thiện, trả lời bằng tiếng Việt.",
      },
      ...session.messages,
    ],
  });

  const reply = await result.text;
  session.messages.push({
    role: "user" as const,
    content: message,
  });
  session.lastUsed = Date.now();
  sessionStore.set(sid, session);

  return {
    sessionId: sid,
    reply,
  };
}
