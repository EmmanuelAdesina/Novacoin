"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DEMO_NOTE, cn } from "@/lib/format";

export const NAV = [
  { href: "/markets", label: "Markets", icon: "markets" },
  { href: "/feed", label: "Activity", icon: "feed" },
  { href: "/leaderboard", label: "Rankings", icon: "leaderboard" },
  { href: "/portfolio", label: "My Bets", icon: "portfolio" },
  { href: "/profile", label: "Profile", icon: "profile" },
] as const;

function active(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile" || pathname.startsWith("/u/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "markets":
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case "feed":
      return (
        <svg {...common}>
          <path d="M3 6h18M3 12h18M3 18h11" />
        </svg>
      );
    case "leaderboard":
      return (
        <svg {...common}>
          <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
        </svg>
      );
    case "portfolio":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="14" rx="3" />
          <path d="M3 10h18M16 15h2" />
          <path d="M7 6V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      );
    default:
      return null;
  }
}

export function Shell({ children, balanceLabel }: { children: ReactNode; balanceLabel: string }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>

      {/* Desktop header */}
      <header className="sticky top-0 z-40 hidden border-b border-line bg-bg/85 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-8">
          <Logo />
          <nav className="flex items-center gap-1" aria-label="Primary">
            {NAV.map((item) => {
              const on = active(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    on ? "bg-ink text-bg" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/portfolio"
              className="flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm"
              aria-label="Demo money"
            >
              <span className="text-muted">💰 Demo:</span>
              <span className="num font-bold">{balanceLabel}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-5">
          <Logo />
          <Link
            href="/portfolio"
            className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-xs"
            aria-label="Demo money"
          >
            <span className="text-muted">💰</span>
            <span className="num font-bold">{balanceLabel}</span>
          </Link>
        </div>
      </header>

      <main id="content" className="mx-auto w-full max-w-[1200px] px-5 pb-32 pt-6 md:px-8 md:pb-20 md:pt-10">
        {children}
      </main>

      <footer className="mx-auto hidden w-full max-w-[1200px] px-8 pb-12 text-xs leading-5 text-faint md:block">
        <p>{DEMO_NOTE}</p>
        <p className="mt-1">Built for Nigerian students — run with just <code className="bg-panel px-1 rounded">npm run dev</code>, no database needed.</p>
      </footer>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Primary mobile"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((item) => {
            const on = active(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium",
                  on ? "text-brand" : "text-muted",
                )}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="Sabi home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white text-lg font-bold">
        S
      </span>
      <span className="text-[1.35rem] font-bold tracking-[-0.03em]">Sabi</span>
    </Link>
  );
}
