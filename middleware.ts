import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeMatchers } from "./lib/routes";
import { NextRequest, NextResponse } from "next/server";

const checkRoleAndRedirect = (
  req: NextRequest,
  role: string | undefined,
  allowedRole: keyof typeof routeMatchers
): NextResponse | undefined => {
  if (routeMatchers[allowedRole](req) && role !== allowedRole) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }
};

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  const role = (sessionClaims?.metadata as { role?: string })?.role;

  //role check
  // const response =
  //   checkRoleAndRedirect(req, role, "admin") ||
  //   checkRoleAndRedirect(req, role, "doctor");

  // if (response) return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
