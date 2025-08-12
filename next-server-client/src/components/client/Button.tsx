import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Button as ButtonShad, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

export default function Button({
  children,
  className,
  href,
  onClick,
  variant,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  asChild?: boolean;
} & (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
)) {
  if (href) {
    return (
      <Link href={href} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <ButtonShad
          className={`cursor-pointer ${className ?? ""}`}
          variant={variant}
        >
          {children}
        </ButtonShad>
      </Link>
    );
  }

  return (
    <ButtonShad
      asChild={asChild}
      className={`cursor-pointer ${className ?? ""}`}
      onClick={onClick}
      variant={variant}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </ButtonShad>
  );
}
