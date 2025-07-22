import Button from "../client/Button";
import Image from "next/image";

export default function Header() {
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
        <div className="flex flex-row justify-center gap-4"></div>
      </div>
      <hr className="w-full border-white" />
    </div>
  );
}
