import { redirect } from "next/navigation";
import RustClientCallbackPageClient from "./_client/pageClient";
import { getSession } from "@/server/getSession";

export default async function RustClientCallbackPage() {
  try {
    const session = await getSession();
    if (!session || !session?.accessToken) {
      return redirect("/rust-client/signin");
    }

    return <RustClientCallbackPageClient accessToken={session.accessToken} />;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
