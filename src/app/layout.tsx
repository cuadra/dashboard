import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Nav from "@/src/components/Nav/Nav";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
