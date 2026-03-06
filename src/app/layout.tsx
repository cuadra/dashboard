import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AppWindow, Settings, Bug, House } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        <nav className="navigation">
          <Link href="/" aria-label="Overview">
            <House />
          </Link>
          <Link href="/components" aria-label="Components">
            <Settings />
          </Link>
          <Link href="/websites" aria-label="Websites">
            <AppWindow />
          </Link>
          <Link href="/#errors" aria-label="Errors">
            <Bug />
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
