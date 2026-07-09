import Link from "next/link";

import { Wordmark } from "@/components/wordmark";

/** Shared app chrome: wordmark home-link + right-side actions. */
export function SiteHeader({
  href = "/dashboard",
  actions,
}: {
  href?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={href}
          className="rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Wordmark />
        </Link>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
