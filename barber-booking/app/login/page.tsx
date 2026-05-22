"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const handleLogin = () => {
    if (password === "osda123") {
      localStorage.setItem(
        "admin-auth",
        "true"
      );

      router.push("/admin");
    } else {
      alert("Złe hasło");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h1 className="text-4xl font-black text-yellow-500 mb-4">
          PANEL LOGIN
        </h1>

        <p className="text-zinc-400 mb-8">
          Zaloguj się do panelu admina 💈
        </p>

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full mb-6 p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 text-black p-4 rounded-2xl font-black"
        >
          Zaloguj
        </button>
      </div>
    </main>
  );
}