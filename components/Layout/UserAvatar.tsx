"use client";

import { useState } from "react";
import { FiUser } from "react-icons/fi";

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
}

export default function UserAvatar({ src, alt, className = "h-10 w-10" }: UserAvatarProps) {
    const [error, setError] = useState(false);

    if (src && !error) {
        return (
            <img
                src={src}
                alt={alt || "User"}
                className={`${className} rounded-full object-cover`}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div
            className={`${className} flex items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400`}
        >
            <FiUser className="h-[50%] w-[50%]" />
        </div>
    );
}
