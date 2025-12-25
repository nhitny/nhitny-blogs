"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";

export default function ThemeSync() {
    const { setTheme } = useTheme();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get theme from URL parameter
        const themeParam = searchParams?.get("theme");

        if (themeParam === "light" || themeParam === "dark") {
            setTheme(themeParam);

            // Remove theme parameter from URL after applying
            const url = new URL(window.location.href);
            url.searchParams.delete("theme");
            window.history.replaceState({}, "", url.toString());
        }
    }, [searchParams, setTheme]);

    return null; // This component doesn't render anything
}
