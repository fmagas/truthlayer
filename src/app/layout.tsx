import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TruthLayer",
  description: "Rule-based sales pipeline reliability analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-teal-700 text-sm font-bold text-white">TL</span>
              <span>TruthLayer</span>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Link href="/observability" className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-950">
                Observability
              </Link>
              <Link href="/upload" className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-950">
                Upload
              </Link>
              <Link href="/results" className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-950">
                Results
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
