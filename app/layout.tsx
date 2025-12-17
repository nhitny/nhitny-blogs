import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar />
            <div className="flex min-h-screen flex-col">
              {children}
              <Footer />
            </div>
            <ScrollToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
