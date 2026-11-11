"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { FiSearch, FiMenu, FiX, FiLogOut, FiSun, FiMoon, FiGrid } from "react-icons/fi";
import UserAvatar from "@/components/Layout/UserAvatar";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/blogs", label: "Bài viết" },
  { href: "/interview", label: "Phỏng vấn" },
  { href: "/about", label: "Giới thiệu" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // close the mobile menu on navigation
  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname?.startsWith(path));
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <nav className={`st-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="st-wrap">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="st-logo" aria-label="Nhitny Blog — trang chủ">
            <b>Nhitny</b>
            <small>blog</small>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`st-navlink${isActive(link.href) ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Link href="/search" className="st-iconbtn" aria-label="Tìm kiếm">
              <FiSearch className="h-[18px] w-[18px]" />
            </Link>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="st-iconbtn"
              aria-label="Đổi giao diện sáng/tối"
            >
              {isDark ? <FiSun className="h-[18px] w-[18px]" /> : <FiMoon className="h-[18px] w-[18px]" />}
            </button>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-2 transition hover:border-st-line"
                  aria-label="Tài khoản"
                >
                  <UserAvatar src={user.photoURL} alt={user.displayName || "User"} className="h-8 w-8" />
                  <span className="hidden max-w-[140px] truncate text-sm font-medium text-st-ink lg:block">
                    {user.displayName || user.email}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="st-menu absolute right-0 mt-2 w-56">
                    <div className="border-b border-st-line p-4">
                      <p className="text-sm font-semibold text-st-ink">{user.displayName}</p>
                      <p className="truncate font-mono text-xs text-st-muted">{user.email}</p>
                      {isAdmin && <span className="st-badge mt-2 inline-block">admin</span>}
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-st-ink hover:bg-indigo-500/10"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiGrid className="h-4 w-4 text-st-accent" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span className="hidden sm:block">
                <Link href="/login" className="st-btn primary sm">
                  Đăng nhập
                </Link>
              </span>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="st-iconbtn md:!hidden"
              aria-label="Mở menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="st-menu mb-3 p-2 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex rounded-xl px-4 py-3 text-base font-medium ${
                  isActive(link.href) ? "bg-indigo-500/10 text-st-ink" : "text-st-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" className="st-btn primary mt-2 w-full justify-center">
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
