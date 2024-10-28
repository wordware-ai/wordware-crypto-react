import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TopLeftLogo } from "./components/TopLeftLogo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Wordware ReAct UI",
  description: "Wordware ReAct Agent UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <TopLeftLogo />
        {children}
      </body>
    </html>
  );
}
