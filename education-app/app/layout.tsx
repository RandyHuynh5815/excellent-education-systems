import type { Metadata } from "next";
import { Patrick_Hand, Open_Sans } from "next/font/google";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Education Systems Explorer",
  description: "Explore global education systems in a virtual classroom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${patrickHand.variable} ${openSans.variable} antialiased font-patrick`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
