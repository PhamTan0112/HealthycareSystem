export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-green-600">
        <HeartPulse size={64} />
        <p className="mt-4 text-lg font-semibold">HealthyCare</p>
        <meta httpEquiv="refresh" content={`1;url=/${role}`} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 cursor-default select-none">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center ">
            Welcome to <br />
            <span className="text-blue-700 text-5xl md:text-6xl">
              Kinda HMS
            </span>
          </h1>
        </div>

        <div className="text-center max-w-xl flex flex-col items-center justify-center">
          <p className="mb-8">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse maxime
            quae numquam possimus dolor. Illum, ipsam laudantium. Reprehenderit
          </p>
          <div className="flex gap-4">
            <Link href="/sign-up">
              <Button className="md:text-base font-light cursor-pointer">
                New Patient
              </Button>
            </Link>

            <Link href="/sign-in">
              <Button
                variant="outline"
                className="md:text-base underline hover:text-blue-600 cursor-pointer"
              >
                Login to account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-8">
        <p className="text-center text-sm">
          &copy; 2024 Kinda Hospital Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
