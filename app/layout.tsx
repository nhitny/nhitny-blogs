import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Suspense } from "react";
import ScrollToTop from "@/components/UI/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import ThemeSync from "@/components/UI/ThemeSync";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={beVietnamPro.className} suppressHydrationWarning>
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
