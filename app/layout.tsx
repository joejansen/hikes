import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hike Research",
  description: "Personal catalog of hut-to-hut hikes worth considering.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur sticky top-0 z-10">
          <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              🥾 Hike Research
            </Link>
            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                List
              </Link>
              <Link href="/map" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Map
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 py-6 text-center">
          Edit data/hikes.yaml to update. Built with Next.js on Vercel.
        </footer>
      </body>
    </html>
  );
}
