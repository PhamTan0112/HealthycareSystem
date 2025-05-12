import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <>
      <ClerkLoading>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-sm text-gray-500">
            Loading sign-in form...
          </span>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </>
  );
}
