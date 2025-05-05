"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function ForceRefreshOnLogin() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const refresh = async () => {
      if (isSignedIn) {
        // ⏱️ Chờ 1 giây để chắc chắn auth state đã sync
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 👉 Nếu cần fetch gì đó từ server, có thể làm ở đây
        // const res = await fetch("/api/check-role");

        window.location.reload();
      }
    };

    refresh();
  }, [isSignedIn]);

  return null;
}
