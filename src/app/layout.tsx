import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
