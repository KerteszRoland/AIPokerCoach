import Button from "../client/Button";
import Image from "next/image";
import SignInButton from "../client/SignInButton";
import SignedInServer from "./SignedInServer";
import SignedOutServer from "./SignedOutServer";
import SignedInProfile from "./SignedInProfile";

export default async function Header() {
  return (
    <div className="py-4 flex flex-col items-center gap-4">
      <div className="flex flex-row justify-between items-center w-full px-4">
        <div>
          <Image src="/logo.png" alt="Logo" width={48} height={48} />
        </div>
        <div className="flex flex-row justify-center gap-4">
          <Button href="/">Home</Button>
          <Button href="/review">Review</Button>
          <Button href="/pokerHandChart">Range Charts</Button>
        </div>
        <div className="flex flex-row justify-center gap-4">
          <SignedInServer>
            <SignedInProfile />
          </SignedInServer>
          <SignedOutServer>
            <SignInButton />
          </SignedOutServer>
        </div>
      </div>
      <hr className="w-full border-white" />
    </div>
  );
}
