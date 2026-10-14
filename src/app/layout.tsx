import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { Shell } from "@/components/shell";
import { getCircuit } from "@/lib/circuit";
import { formatNgn, formatWhen } from "@/lib/format";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Sabi — see it, call it, keep the record",
    template: "%s · Sabi",
  },
  description:
    "A demonstration circuit for opportunities, calls, competitions, and public standing. Nigerian naira first. Simulated purses only.",
};

export const viewport: Viewport = {
  themeColor: "#1b4636",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let boot: string | null = null;
  let shell: ReactNode = children;
  try {
    const circuit = await getCircuit();
    shell = (
      <Shell
        you={{
          displayName: circuit.you.displayName,
          initials: circuit.you.initials,
          hue: circuit.you.hue,
          city: circuit.you.city,
        }}
        purseLabel={`Demo purse ${formatNgn(circuit.you.purse)}`}
        notes={circuit.notes.slice(0, 12).map((note) => ({
          id: note.id,
          title: note.title,
          body: note.body,
          href: note.href,
          read: note.read,
          when: formatWhen(note.createdAt),
        }))}
      >
        {children}
      </Shell>
    );
  } catch (error) {
    boot = error instanceof Error ? error.message : "The circuit could not start.";
  }

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className={`${outfit.className} antialiased`}>
        {boot ? (
          <main className="mx-auto max-w-xl px-6 py-16">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Sabi</p>
            <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em]">The circuit did not start.</h1>
            <p className="mt-4 text-sm leading-6 text-muted">{boot}</p>
          </main>
        ) : (
          shell
        )}
      </body>
    </html>
  );
}
