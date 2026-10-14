"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { COPY } from "@/lib/format";
import { NotificationBell } from "@/components/widgets";
import { Avatar, Mark, cn } from "@/components/ui";

const NAV = [
  { href: "/", label: "Now" },
  { href: "/explore", label: "Explore" },
  { href: "/calls", label: "Calls" },
  { href: "/compete", label: "Compete" },
  { href: "/board", label: "Board" },
  { href: "/desk", label: "Desk" },
  { href: "/passes", label: "Passes" },
  { href: "/u/you", label: "You" },
];

const MOBILE = [
  { href: "/", label: "Now" },
  { href: "/calls", label: "Calls" },
  { href: "/compete", label: "Compete" },
  { href: "/board", label: "Board" },
  { href: "/u/you", label: "You" },
];

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/u/you") return pathname === "/u/you";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({
  children,
  you,
  purseLabel,
  notes,
}: {
  children: ReactNode;
  you: { displayName: string; initials: string; hue: string; city: string };
  purseLabel: string;
  notes: Array<{ id: number; title: string; body: string; href: string | null; read: boolean; when: string }>;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-sand text-ink">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col bg-night text-[#f3eee6] lg:flex">
          <div className="px-5 pt-6">
            <Link href="/" aria-label="Sabi home">
              <Mark light />
            </Link>
            <p className="mt-3 text-xs leading-5 text-[#cfc6ba]">See it. Call it. Keep the record.</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#e7d3a8]">Circuit 01 · ₦</p>
          </div>
          <nav className="mt-8 flex flex-1 flex-col px-3" aria-label="Primary">
            {NAV.map((item) => {
              const on = active(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "px-3 py-2.5 text-sm",
                    on ? "bg-[#f3eee6] text-night" : "text-[#e7e1d8] hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-5 py-4 text-xs leading-5 text-[#cfc6ba]">
            <p>Demo seat · {you.city}</p>
            <p className="mt-1 text-[#e7d3a8]">{purseLabel}</p>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="sticky top-0 z-30 border-b border-line bg-sand">
            <p className="bg-forest px-4 py-2 text-center text-[12px] leading-5 text-[#f6f1e7]">{COPY.banner}</p>
            <div className="flex items-center gap-3 px-4 py-3 md:px-8">
              <Link href="/" className="lg:hidden" aria-label="Sabi home">
                <Mark compact />
              </Link>
              <form action="/explore" className="hidden min-w-0 flex-1 md:block">
                <label className="sr-only" htmlFor="q">
                  Search the circuit
                </label>
                <input
                  id="q"
                  name="q"
                  placeholder="Search calls, rooms, people"
                  className="w-full max-w-md bg-paper px-3 py-2 text-sm"
                />
              </form>
              <div className="ml-auto flex items-center gap-2">
                <Link href="/explore" className="text-sm md:hidden">
                  Search
                </Link>
                <NotificationBell notes={notes} />
                <Link href="/desk" className="max-w-[7.5rem] truncate text-xs num sm:max-w-none sm:text-sm">
                  {purseLabel}
                </Link>
                <Link href="/u/you" aria-label="Your record">
                  <Avatar initials={you.initials} hue={you.hue} size={34} />
                </Link>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto border-t border-line px-4 py-2 text-sm lg:hidden">
              {NAV.filter((item) => !["/", "/calls", "/compete", "/board", "/u/you"].includes(item.href)).map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 text-muted">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <main id="content" className="mx-auto w-full max-w-[1120px] px-4 py-6 pb-28 md:px-8 lg:pb-16">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-[1120px] px-4 pb-28 text-xs leading-5 text-muted md:px-8 lg:pb-10">
            <p>
              Sabi, pronounced sah-bee, means to know. Built first for Nigeria. The circuit is designed to travel, not to
              become a foreign-exchange product.
            </p>
            <p className="mt-2">{COPY.affiliation}</p>
            <p className="mt-2">{COPY.adult} This preview shares one demonstration seat.</p>
          </footer>
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper lg:hidden" aria-label="Mobile">
        {MOBILE.map((item) => {
          const on = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={cn("px-1 py-3 text-center text-[11px] uppercase tracking-[0.12em]", on ? "text-forest" : "text-muted")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
