import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HyperMythX SuperAssembly Starter",
  description: "Combined Interface Assembly and SuperAssembly starter."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
