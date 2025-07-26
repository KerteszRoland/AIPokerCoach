import { getSession } from "./getSession";

export async function getUserIdFromSession() {
  const session = await getSession();
  return session?.userId ?? null;
}
