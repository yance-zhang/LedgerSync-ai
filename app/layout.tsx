import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerSync AI",
  description: "Organize accounting documents and keep every file traceable.",
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
