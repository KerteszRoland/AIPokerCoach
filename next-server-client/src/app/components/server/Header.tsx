import Button from "../client/Button";

export default function Header() {
  return (
    <div className="py-4 flex flex-col items-center gap-4">
      <div className="flex flex-row justify-center gap-4">
        <Button href="/">Home</Button>
        <Button href="/review">Review</Button>
        <Button href="/pokerHandChart">Range Charts</Button>
      </div>
      <hr className="w-full border-white" />
    </div>
  );
}
