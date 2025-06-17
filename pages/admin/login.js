import { useState } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");  // Redirect to admin page if login is successful
    } catch (error) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Đăng nhập Admin</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
