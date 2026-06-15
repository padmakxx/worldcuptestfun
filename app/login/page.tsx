"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handlePinChange = (i: number, val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      const next = [...pin];
      next[i] = "";
      setPin(next);
      return;
    }
    if (digits.length > 1) {
      const next = [...pin];
      for (let j = 0; j < digits.length && i + j < 6; j++) {
        next[i + j] = digits[j];
      }
      setPin(next);
      const focusIdx = Math.min(i + digits.length, 5);
      pinRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...pin];
    next[i] = digits;
    setPin(next);
    if (i < 5) pinRefs.current[i + 1]?.focus();
  };

  const handlePinKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pinStr = pin.join("");
    if (pinStr.length !== 6) { setError("Enter your 6-digit PIN"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin: pinStr }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Login failed"); return; }
    router.push(data.isAdmin ? "/admin" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-3xl font-black text-white mb-1">Welcome Back!</h1>
          <p className="text-gray-400">Sign in to make your predictions</p>
        </div>

        <div className="card-glow rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your username"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 font-medium"
                style={{background:"rgba(255,255,255,0.06)",border:"2px solid rgba(255,215,0,0.2)"}}
                onFocus={e => e.target.style.borderColor = "#FFD700"}
                onBlur={e => e.target.style.borderColor = "rgba(255,215,0,0.2)"}
                required
              />
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">6-Digit PIN</label>
              <div className="flex gap-2 justify-center">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { pinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePinChange(i, e.target.value)}
                    onKeyDown={e => handlePinKeyDown(i, e)}
                    className="pin-input"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 rounded-xl text-lg font-bold"
            >
              {loading ? "Signing in..." : "🔐 Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            New here?{" "}
            <Link href="/register" className="text-yellow-400 font-semibold hover:text-yellow-300">
              Register to play
            </Link>
          </p>
          <p className="text-center mt-2">
            <Link href="/" className="text-gray-500 text-xs hover:text-gray-400">← Back to home</Link>
          </p>
        </div>

        {/* Hint */}
        <div className="mt-6 text-center text-xs text-gray-600">
          🔒 PIN is hashed and never stored in plain text
        </div>
      </div>
    </div>
  );
}
