import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-edge";

const PROTECTED_PREFIXES = ["/conta", "/quadras/nova", "/partidas/nova"];

export default auth((req) => {
  const isProtected = PROTECTED_PREFIXES.some((prefix) => req.nextUrl.pathname.startsWith(prefix));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
