import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import { Account, AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import db from "@/server/db";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId: string;
  }
}

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account: Account | null;
    }) {
      //refreshAccessToken(token);
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account?.access_token;
        token.refreshToken = account?.refresh_token;
        token.accessTokenExpires = account?.expires_at;

        if (token.sub) {
          const existingUser = await db.query.Users.findFirst({
            where: eq(Users.googleId, token.sub),
          });
          if (existingUser) {
            token.userId = existingUser.id;
          } else {
            const newUser = await db
              .insert(Users)
              .values({
                id: crypto.randomUUID(),
                googleId: token.sub,
                createdAt: new Date().toISOString(),
                name: user?.name || "",
                email: user?.email || "",
                image: user?.image || null,
              })
              .returning();
            token.userId = newUser[0].id;
          }
        }
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, like an access_token from a provider.

      if (
        token.accessTokenExpires &&
        Date.now() / 1000 > token.accessTokenExpires
      ) {
        return {} as Session;
      }

      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.userId = token.userId;
      return session;
    },
  },
} satisfies AuthOptions;

export default authOptions;
