import { getSession } from "@/server/getSession";
import { redirect } from "next/navigation";
import RustClientSignInPageClient from "./_client/pageClient";

export default async function RustClientPage() {
  try {
    const session = await getSession();
    if (session && session?.accessToken) {
      return redirect("/rust-client/callback");
    }
    return <RustClientSignInPageClient />;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
