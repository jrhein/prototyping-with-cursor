/**
 * Root layout component that wraps all pages in the application.
 * This layout:
 * - Sets up DM Sans as primary font and Geist Mono for monospace
 * - Configures metadata like title and favicon
 * - Provides the basic HTML structure
 * - Applies font variables to the entire app
 */

import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ['400', '500', '700'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Justin's prototypes",
  description: "The home for all my prototypes",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
