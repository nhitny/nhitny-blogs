import "@/styles/globals.css";
import "@/styles/soft.css";
import "katex/dist/katex.min.css";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
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
    <html lang="vi" suppressHydrationWarning className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
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
