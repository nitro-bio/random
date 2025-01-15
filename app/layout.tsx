import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

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
      <body
        className={cn(
          `antialiased`,
          "dark flex min-h-screen bg-zinc-900 px-4 py-2 text-white",
        )}
      >
        {children}
      </body>
    </html>
  );
}
