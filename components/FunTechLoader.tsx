"use client";

import { useState, useEffect } from "react";

export default function FunTechLoader() {
    const [textIndex, setTextIndex] = useState(0);

    const loadingTexts = [
        "Đang tải dữ liệu...",
        "Đang pha cà phê cho Server...",
        "Đang hack vào mainframe...",
        "Đang debug... đợi xíu...",
        "Đang cài đặt WinRAR...",
        "Đang tìm dấu chấm phẩy bị thiếu...",
        "Đang hỏi Chat GPT cách code...",
        "404 Not Found... Đùa thôi!",
        "Đang triệu hồi bug...",
        "Server đang chạy bộ...",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % loadingTexts.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full p-4">
            {/* Animated Icon */}
            <div className="relative flex items-center justify-center mb-6">
                {/* Glowing Circle Background */}
                <div className="absolute h-24 w-24 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>

                {/* Code Brackets Animation */}
                <div className="flex items-center space-x-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    <span className="animate-[bounce_1s_infinite]">{`{`}</span>
                    <span className="flex space-x-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></span>
                    </span>
                    <span className="animate-[bounce_1s_infinite]">{`}`}</span>
                </div>
            </div>

            {/* Fun Text */}
            <div className="h-8">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 animate-fade-in-up font-mono">
                    {`> ${loadingTexts[textIndex]}`}
                    <span className="animate-pulse">_</span>
                </p>
            </div>

            <style jsx>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}
