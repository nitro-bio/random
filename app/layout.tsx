import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NitroLogo } from "@/components/NitroLogo";
import Link from "next/link";
import { GithubIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <body>
        <main
          className={cn(
            `antialiased`,
            "dark flex min-h-screen flex-col bg-zinc-900 px-4 py-2 text-white",
          )}
        >
          <nav className="flex items-center justify-between gap-4 border-b border-zinc-800 py-4">
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

          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
