import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root sahifani yo'naltirish
  if (pathname === "/") {
    const isAuth = request.cookies.get("is_authenticated")?.value === "true";
    const role = request.cookies.get("user_role")?.value;
    if (isAuth && role === "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAuth = request.cookies.get("is_authenticated")?.value === "true";
  const role = request.cookies.get("user_role")?.value;

  if (!isAuth || role !== "super_admin") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
