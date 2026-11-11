"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGithub, FiLinkedin, FiMail, FiInstagram, FiArrowUpRight } from "react-icons/fi";

const SOCIALS = [
  { href: "https://github.com/nhitny", label: "GitHub", Icon: FiGithub },
  { href: "https://www.linkedin.com/in/nhitny2802/", label: "LinkedIn", Icon: FiLinkedin },
  { href: "https://www.instagram.com/__yennhitn__/", label: "Instagram", Icon: FiInstagram },
  { href: "mailto:nhitny.vn@gmail.com", label: "Email", Icon: FiMail },
];

export default function Footer() {
  const pathname = usePathname();

  // Ẩn footer ở trang admin
  if (pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="st-footer">
      <div className="st-wrap flex flex-col items-center gap-6 py-10 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Link href="/" className="st-logo">
            <b>Nhitny</b>
            <small>blog</small>
          </Link>
          <p className="font-mono text-xs text-st-muted">
            © {currentYear} · ghi chép về AI, NLP &amp; engineering
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 md:items-end">
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="st-footer-social"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <a href="https://nhitny.github.io" target="_blank" rel="noopener noreferrer" className="st-link text-sm">
            Portfolio của mình <FiArrowUpRight />
          </a>
        </div>
      </div>
    </footer>
  );
}
