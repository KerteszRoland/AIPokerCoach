import {
  NextAuthMiddlewareOptions,
  NextRequestWithAuth,
  withAuth,
} from "next-auth/middleware";

import { NextResponse, NextRequest } from "next/server";
import authOptions from "./app/api/auth/[...nextauth]/options";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req: NextRequestWithAuth) {
    console.log(req.nextauth.token);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/api/hand"],
};
