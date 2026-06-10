import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { getSessionUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Futistietäjä",
  description: "Jalkapallon MM-kisojen 2026 veikkauspeli",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="fi" className={`${geistSans.variable} w-full antialiased`}>
      <body className="h-screen w-full overflow-hidden bg-zinc-50 font-sans">
        <div className="flex h-full flex-col">
          {user && <Header name={user.name} />}
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
          {user && <BottomNav isAdmin={user.isAdmin} />}
        </div>
      </body>
    </html>
  );
}
