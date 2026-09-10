import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const PUBLIC_ADMIN_ROUTES = [
  "/admin/login",
  "/admin/signup",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore all public website routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check whether current page is public
  const isPublicRoute = PUBLIC_ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Get token
  const token = req.cookies.get("admin_token")?.value;

  // Verify token
  const payload = token ? await verifyToken(token) : null;

  const isAuthenticated = !!payload;

  /**
   * Not logged in
   */
  if (!isAuthenticated && !isPublicRoute) {
    const url = req.nextUrl.clone();

    url.pathname = "/admin/login";
    url.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(url);
  }

  /**
   * Already logged in
   */
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};