"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FiArrowLeft } from "react-icons/fi";
import { SoftBackground } from "@/components/Soft/Soft";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user) router.push("/blogs");
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle(); // redirect is handled in AuthContext
    } catch (error: any) {
      console.error("Login error:", error);
      alert(`Đăng nhập thất bại: ${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="st-home st-page flex min-h-[85vh] items-center">
      <SoftBackground />
      <div className="st-wrap py-24">
        <div className="st-card relative mx-auto max-w-md overflow-hidden p-8 text-center sm:p-10">
          <div className="st-mini-avatar mx-auto mb-6 !h-24 !w-24">
            <Image src="/chibi.webp" alt="" width={124} height={192} />
          </div>
          <p className="font-mono text-xs text-st-muted">~/login</p>
          <h1 className="st-h2 mt-1">
            Chào bạn <em>quay lại</em>
          </h1>
          <p className="st-body !text-base">Đăng nhập để thích bài viết và để lại bình luận.</p>

          {loading ? (
            <div className="mx-auto mt-8 h-12 w-full animate-pulse rounded-full bg-st-line" />
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="st-btn ghost mt-8 w-full justify-center !py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-st-muted border-t-transparent" />
                  Đang đăng nhập…
                </>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5" />
                  Tiếp tục với Google
                </>
              )}
            </button>
          )}

          <p className="mt-6 text-xs text-st-muted">Mình chỉ dùng tên và ảnh đại diện Google để hiển thị cạnh bình luận của bạn.</p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="st-link text-sm">
            <FiArrowLeft /> Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
