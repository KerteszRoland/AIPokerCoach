import Button from "../client/Button";
import Image from "next/image";
import SignInButton from "../client/SignInButton";
import SignedInServer from "./SignedInServer";
import SignedOutServer from "./SignedOutServer";
import SignedInProfile from "./SignedInProfile";
import Link from "next/link";
import ThemeToggle from "@/components/client/ThemeToggle";
import { Separator } from "../ui/separator";

export default async function Header() {
  return (
    <div className="py-4 flex flex-col items-center gap-4">
      <div className="flex flex-row justify-between items-center w-full px-4">
        <div>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={48} height={48} />
          </Link>
        </div>
        <div className="flex flex-row justify-center gap-4">
          <Button href="/">Home</Button>
          <Button href="/review">Review</Button>
          <Button href="/pokerHandChart">Range Charts</Button>
        </div>
        <div className="flex flex-row justify-center items-center gap-4">
          <SignedInServer>
            <SignedInProfile />
          </SignedInServer>
          <SignedOutServer>
            <SignInButton />
          </SignedOutServer>
          <ThemeToggle />
        </div>
      </div>
      <Separator className="border-1" />
    </div>
  );
}
