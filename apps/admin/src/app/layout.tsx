import type { Metadata } from "next";
import "./globals.css";
import "@oja/config/src/oja-ogbomoso-design-system.css";

export const metadata: Metadata = {
  title: "Oja Ogbomoso - Admin",
  description: "Admin dashboard for Oja Ogbomoso",
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
