"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function ForceRefreshOnLogin() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const refresh = async () => {
      if (isSignedIn) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        window.location.reload();
      }
    };

    refresh();
  }, [isSignedIn]);

  return null;
}
