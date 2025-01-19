import Providers from "@/app/providers";
import { NitroLogo } from "@/components/NitroLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { GithubIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sequences by Nitro Bio",
  description: "Generate random biological sequences",
  openGraph: {
    title: "Sequences by Nitro Bio",
    description: "Generate random biological sequences",
    url: "https://random.nitro.bio",
    siteName: "Sequences by Nitro Bio",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/8ea7e000-f299-464d-b895-fca6c6933c2f.png?token=32O7LqXhkzq1hzBjv3agiVlnUcn2sIW_Mjcy2PkGy5o&height=679&width=1200&expires=33272921171",
        width: 1200,
        height: 679,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sequences by Nitro Bio",
    description: "Generate random biological sequences",
    images: [
      "https://opengraph.b-cdn.net/production/images/8ea7e000-f299-464d-b895-fca6c6933c2f.png?token=32O7LqXhkzq1hzBjv3agiVlnUcn2sIW_Mjcy2PkGy5o&height=679&width=1200&expires=33272921171",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `antialiased`,
          "dark flex min-h-screen flex-col bg-zinc-900 px-1 py-2 text-white",
          "overflow-hidden",
        )}
      >
        <nav className="flex items-center gap-4 border-b border-zinc-800 px-4 py-4">
          <Link
            href="https://nitro.bio/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <NitroLogo className="h-6" />
          </Link>

          <Link href="https://github.com/nitro-bio/random">
            <Button className="flex items-center gap-2" variant="outline">
              <span className="hidden sm:inline-block">Feedback</span>
              <GithubIcon className="h-8 w-8" />
            </Button>
          </Link>
        </nav>
        <Providers>
          <main className="mx-auto h-full w-full max-w-6xl p-4">
            <section className="flex flex-col items-start gap-1 pb-6 pt-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
                Sequence Generator
              </h1>
              <p className="max-w-2xl text-lg font-light text-foreground">
                A simple tool to generate AA/DNA sequence for testing
              </p>
            </section>
            {children}
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
