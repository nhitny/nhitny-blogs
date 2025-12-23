import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeSync from "@/components/ThemeSync";

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Suspense fallback={null}>
            <ThemeSync />
          </Suspense>
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
