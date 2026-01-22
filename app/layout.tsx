import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import ScrollToTop from "@/components/UI/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import ThemeSync from "@/components/UI/ThemeSync";

import { Toaster } from "react-hot-toast";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nhitny Blog - AI, Deep Learning & Engineering",
    template: "%s | Nhitny Blog",
  },
  description: "Blog cá nhân chia sẻ kiến thức về Deep Learning, Machine Learning, NLP, Large Language Models (LLM) và Software Engineering thực chiến.",
  keywords: ["AI", "Deep Learning", "Machine Learning", "NLP", "LLM", "Software Engineering", "Nhitny", "Blog Công Nghệ"],
  authors: [{ name: "Nhitny" }],
  creator: "Nhitny",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://nhitny-blogs.vercel.app",
    siteName: "Nhitny Blog",
    title: "Nhitny Blog - AI, Deep Learning & Engineering",
    description: "Chia sẻ kiến thức thực chiến về AI, LLM và Engineering.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nhitny Blog - AI & Tech",
    description: "Chia sẻ kiến thức thực chiến về AI, LLM và Engineering.",
    creator: "@nhitny",
  },
  metadataBase: new URL("https://nhitny-blogs.vercel.app"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={beVietnamPro.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Suspense fallback={null}>
            <ThemeSync />
          </Suspense>
          <AuthProvider>
            <Toaster position="top-right" />
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
