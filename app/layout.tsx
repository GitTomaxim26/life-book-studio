// app/layout.tsx
import type { Metadata } from "next";
import { Fraunces, Spectral, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
});
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Life Book Studio",
  description: "Author the book of your life.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Shell toggles `light` on <body> for the linen/Paper edition. */}
      <body className={`${fraunces.variable} ${spectral.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
