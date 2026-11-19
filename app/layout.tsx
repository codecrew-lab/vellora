import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELLORA — A beautiful world where stories come to life",
  description:
    "Discover beautiful stories, explore imaginative worlds, and experience timeless storytelling through VELLORA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
