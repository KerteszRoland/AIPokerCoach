import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

export default function Button({
  children,
  className,
  href,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
} & (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
)) {
  if (href) {
    return (
      <Link
        href={href}
        className={`text-center border rounded-md p-2 cursor-pointer ${className}`}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={`text-center border rounded-md p-2 cursor-pointer ${className}`}
      onClick={onClick}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
