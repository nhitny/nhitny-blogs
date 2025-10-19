import "@/styles/globals.css";
import ClientProviders from "./ClientProviders";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
