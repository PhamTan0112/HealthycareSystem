import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </>
  );
}
