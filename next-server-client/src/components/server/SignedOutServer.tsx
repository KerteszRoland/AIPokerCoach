import authOptions from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";

export default async function SignedOutServer({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    return null;
  }

  return <>{children}</>;
}
