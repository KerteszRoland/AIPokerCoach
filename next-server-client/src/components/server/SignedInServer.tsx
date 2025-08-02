import { getSession } from "@/server/getSession";
import { ReactNode } from "react";

export default async function SignedInServer({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
