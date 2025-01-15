import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NitroLogo } from "@/components/NitroLogo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Random Sequence Generator",
  description: "A random sequence generator by @nitro-bio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main
          className={cn(
            `antialiased`,
            "dark flex min-h-screen flex-col bg-zinc-900 px-4 py-2 text-white",
          )}
        >
          <nav className="flex gap-4 border-b border-zinc-800 py-4">
            <Link
              href="https://nitro.bio/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <NitroLogo className="h-8 pb-2" />
            </Link>
          </nav>

          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
