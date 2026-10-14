import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/shell";
import { getData } from "@/lib/data";
import { formatCompactNgn } from "@/lib/format";
// Outfit is self-hosted so the app builds and renders without reaching Google Fonts.
import "@fontsource-variable/outfit";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Sabi · Predict events. Trade your view. Follow top traders.",
    template: "%s · Sabi",
  },
  description:
    "Take positions on real-world outcomes, see what others are backing, and follow the people making the best calls.",
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
    data = await getData();
  } catch (error) {
    boot = error instanceof Error ? error.message : "Sabi could not start.";
  }

  return (
    <html lang="en">
      <body className="antialiased">
        {data ? (
          <Shell balanceLabel={formatCompactNgn(data.you.balance)}>{children}</Shell>
        ) : (
          <main className="mx-auto max-w-xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Sabi</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Sabi is not available right now.</h1>
            <p className="mt-4 text-sm leading-6 text-muted">{boot ?? "Sabi could not start."}</p>
          </main>
        )}
      </body>
    </html>
  );
}
