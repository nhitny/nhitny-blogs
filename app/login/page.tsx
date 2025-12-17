"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // If already logged in, redirect
        if (user) {
            router.push("/blogs");
        }
    }, [user, router]);

    const handleGoogleSignIn = async () => {
        setIsLoggingIn(true);
        try {
            await signInWithGoogle();
            // Redirect is handled in AuthContext
        } catch (error: any) {
            console.error("Login error:", error);
            // Show more detailed error for debugging
            alert(`Đăng nhập thất bại: ${error.message}`);
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                    {/* Logo/Title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            NhiTny Blog
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Đăng nhập để tiếp tục
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <div className="mt-8">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn}
                            className="flex w-full items-center justify-center space-x-3 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            {isLoggingIn ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent dark:border-gray-300"></div>
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                <>
                                    <FcGoogle className="h-6 w-6" />
                                    <span>Đăng nhập với Google</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>Bằng cách đăng nhập, bạn đồng ý với</p>
                        <p className="mt-1">
                            <a href="#" className="text-indigo-600 hover:underline dark:text-indigo-400">
                                Điều khoản sử dụng
                            </a>
                            {" và "}
                            <a href="#" className="text-indigo-600 hover:underline dark:text-indigo-400">
                                Chính sách bảo mật
                            </a>
                        </p>
                    </div>
                </div>

                {/* Back to home */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    >
                        ← Quay lại trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}
