import Image from "next/image";
import SignOutButton from "../client/SignOutButton";
import { getSession } from "@/server/getSession";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default async function SignedInProfile() {
  const session = await getSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row items-center gap-2 cursor-pointer">
          {session?.user && (
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={session.user?.image ?? ""}
                alt="User image"
                width={48}
                height={48}
                className="rounded-full"
              />
              <AvatarFallback>
                {session.user?.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>
          {session?.user?.name && <p>{session.user.name}</p>}
        </DropdownMenuLabel>
        <DropdownMenuLabel>
          <div className="mx-auto">
            <SignOutButton />
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
