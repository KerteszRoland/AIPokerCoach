import { redirect } from "next/navigation";
import { getSession } from "./getSession";

export default async function getSessionOrRedirect() {
  const session = await getSession();

  if (!session || !session.userId) {
    return redirect("/api/auth/signin");
  }

  return session;
}
