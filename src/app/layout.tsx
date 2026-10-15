import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/shell";
import { getData } from "@/lib/data";
import { formatCompactNgn } from "@/lib/format";
import "@fontsource-variable/outfit";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Sabi · Predict, bet demo money, follow sharp guys",
    template: "%s · Sabi",
  },
  description:
    "Nigerian student prediction app. Bet on sports, entertainment, campus things with fake demo money. No real money, just practice.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let data: Awaited<ReturnType<typeof getData>> | null = null;
  let boot: string | null = null;
  try {
    data = getData();
  } catch (error) {
    boot = error instanceof Error ? error.message : "Sabi no load right now.";
  }

  return (
    <html lang="en">
      <body className="antialiased">
        {data ? (
          <Shell balanceLabel={formatCompactNgn(data.you.balance)}>{children}</Shell>
        ) : (
          <main className="mx-auto max-w-xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Sabi</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">Sabi no load.</h1>
            <p className="mt-4 text-sm leading-6 text-muted">{boot ?? "Something go wrong. Restart am."}</p>
          </main>
        )}
      </body>
    </html>
  );
}
