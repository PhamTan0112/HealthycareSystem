import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl md:text-5xl font-bold text-center">
          <h1>
            welcome to <br></br>{" "}
            <span className="text-blue-700 text-5xl md:text-6xl">
              HMS KINDA
            </span>
          </h1>
        </div>
        <div className="text-center max-w-xl flex flex-col items-center justify-center">
          <p className="mb-8"></p>
          asdasdasd adsasda sdasd asdas dasd asd asd asd asdas asd as as dasdas
          dsd asdasd asdasd asd as d
          <div className="flex gap-4">
            {userId ? (
              <>
                <Link href={"/dashboard"}>
                  <Button>View Dashboard</Button>
                </Link>
                <UserButton></UserButton>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button className="md:text-base font-light">
                    New Patient
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    className="md:text-base underline hover:text-blue-600"
                  >
                    Login to account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="mt-8">
        <p className="text-center text-sm">
          &copy; 2024 Kinda Hospital Management System. All right reserved.
        </p>
      </footer>
    </div>
  );
}
