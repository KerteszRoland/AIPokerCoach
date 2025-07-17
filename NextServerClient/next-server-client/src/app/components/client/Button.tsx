import Link from "next/link";

export default function Button({
  children,
  className,
  href,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  [key: string]: any;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className={`text-center border rounded-md p-2 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={`text-center border rounded-md p-2 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
