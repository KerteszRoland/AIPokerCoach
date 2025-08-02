import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const loggedInRoutes = ["/review", "/pokerHandChart"];

function isLoggedInRoute(path: string) {
  return loggedInRoutes.some((route) => path.match(new RegExp(`^${route}$`)));
}

function isPublicRoute(path: string) {
  return !isLoggedInRoute(path);
}

function isApiRoute(path: string) {
  return path.startsWith("/api");
}

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    if (
      isApiRoute(pathname) ||
      isPublicRoute(pathname) ||
      (isLoggedInRoute(pathname) && req.nextauth.token)
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        const loggedIn = !!token;
        const { pathname } = req.nextUrl;
        if (isApiRoute(pathname) || isPublicRoute(pathname)) {
          return true;
        }
        if (isLoggedInRoute(pathname)) {
          return loggedIn;
        }
        return false;
      },
    },
  }
);

export const config = {
  matcher: ["/:path*"],
};
