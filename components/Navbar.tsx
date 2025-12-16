"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({ topics = [] as string[] }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? (snap.data() as any).role : null;
        setIsAdmin(role === "admin");
      } catch {
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    });
    return () => unsub();
  }, []);

  const toggle = () => mounted && setTheme(theme === "light" ? "dark" : "light");

  return (
    <>
      <header className="bg-dark fixed z-50 w-full border-t-4 border-indigo-600 shadow dark:border-indigo-900 dark:shadow-2">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-50 hover:text-indigo-400">
                Latest
              </Link>

              <div className="dropdown relative inline-block">
                <button className="cursor-pointer text-gray-50 hover:text-indigo-400">
                  Posts ▾
                </button>
                <ul className="dropdown-menu absolute left-1/3 hidden w-40 rounded-xl bg-white pt-6 text-gray-700 dark:bg-dark">
                  {topics.map((topic) => (
                    <li className="cursor-pointer" key={topic}>
                      <Link
                        href={`/topic/${topic}`}
                        className="block whitespace-nowrap rounded-xl bg-white px-4 py-2 text-gray-800 dark:bg-dark dark:text-gray-50"
                      >
                        {topic}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={toggle} className="text-gray-50 hover:text-indigo-400">
                {mounted && theme === "dark" ? (
                  <HiSun className="text-xl" />
                ) : (
                  <HiMoon className="text-xl" />
                )}
              </button>

              <Link href="/about" className="text-gray-50 hover:text-indigo-400">
                About
              </Link>

              {/* Chỉ hiện khi đã check xong & user là admin */}
              {!isChecking && isAdmin && (
                <Link href="/admin/dashboard" className="text-gray-50 hover:text-indigo-400">
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="h-[72px]" />
    </>
  );
}
