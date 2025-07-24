import authOptions from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Image from "next/image";
import SignOutButton from "../client/SignOutButton";

export default async function SignedInProfile() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-col items-center gap-2">
        {session?.user && (
          <Image
            src={session.user.image || ""}
            alt="User image"
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        {session?.user?.name && <p>{session.user.name}</p>}
      </div>
      <SignOutButton />
    </div>
  );
}
