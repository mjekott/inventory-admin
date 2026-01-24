import { NextRequest, NextResponse } from "next/server";
import { REFRESH_TOKEN_KEY } from "./lib/session";


export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;


  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;
  const isAuthenticated = Boolean(refreshToken);


  // Protected routes are those that are neither auth routes nor public routes
  const isProtectedRoute = pathname.startsWith("/dashboard")

  // If user is NOT authenticated and trying to access a protected route -> redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/", request.url);
    // Preserve intended destination to support post-login redirect
    loginUrl.searchParams.set("redirectAfterLogin", pathname);
    return NextResponse.redirect(loginUrl);
  }


  if(pathname === "/" && isAuthenticated){
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }



  return NextResponse.next();
}

// Apply to all pages except static assets and API routes using a negative lookahead
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|opengraph-image.png|api).*)",
  ],
};