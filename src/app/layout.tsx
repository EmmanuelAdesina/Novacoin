import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://novacoin.zevcloud.app"),
  title: "Novacoin — What if digital money felt this easy?",
  description: "A new digital asset we're exploring for everyday Nigerians. Buy, hold, send, receive, use.",
  openGraph: {
    title: "Novacoin — What if digital money felt this easy?",
    description: "A new digital asset we're exploring for everyday Nigerians. Buy, hold, send, receive, use.",
    url: "https://novacoin.zevcloud.app",
    siteName: "Novacoin",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Novacoin — What if digital money felt this easy?",
      },
    ],
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novacoin — What if digital money felt this easy?",
    description: "A new digital asset we're exploring for everyday Nigerians. Buy, hold, send, receive, use.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}