import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FamilyBoard",
  description: "A daily schedule, chore chart, and rewards board for the family.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <Link href="/" className="text-lg font-bold text-brand-600 whitespace-nowrap mr-2">
                🏠 FamilyBoard
              </Link>
              <Link
                href="/week"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                📅 Week
              </Link>
              <Link
                href="/rewards"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                🏆 Rewards
              </Link>
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap ml-auto"
              >
                ⚙️ Parent Admin
              </Link>
            </nav>
          </header>
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
