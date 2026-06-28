import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, unpack } from "@/lib/session";

const PUBLIC_PATHS = ["/", "/api"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!unpack(sessionToken)) {
    const res = NextResponse.redirect(new URL("/?expired=1", request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
