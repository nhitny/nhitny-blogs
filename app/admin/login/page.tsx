"use client";
import { useState } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      const role = snap.exists() ? (snap.data() as any).role : null;
      if (role !== "admin") {
        await signOut(auth);
        setError("Tài khoản không có quyền admin.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      {/* Nút quay lại */}
      <div className="mb-4">
        <Link href="/blogs" className="text-sm text-indigo-400 hover:underline">
          ← Back to Blog
        </Link>
      </div>

      <h1 className="mb-4 text-4xl font-bold">Đăng nhập Admin</h1>
      {error && <p className="mb-3 text-red-500">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border border-gray-700 bg-gray-900 p-2 mb-3"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full rounded border border-gray-700 bg-gray-900 p-2 mb-3"
          required
        />
        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
