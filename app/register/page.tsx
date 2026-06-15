"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (refs: typeof pinRefs, setter: typeof setPin, current: string[], i: number, val: string) => {
    // Take only the last digit typed (handles autofill / paste of full PIN into first box)
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      const next = [...current];
      next[i] = "";
      setter(next);
      return;
    }
    // If multiple digits (paste), fill from current index onwards
    if (digits.length > 1) {
      const next = [...current];
      for (let j = 0; j < digits.length && i + j < 6; j++) {
        next[i + j] = digits[j];
      }
      setter(next);
      const focusIdx = Math.min(i + digits.length, 5);
      refs.current[focusIdx]?.focus();
      return;
    }
    const next = [...current];
    next[i] = digits;
    setter(next);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handlePinKeyDown = (refs: typeof pinRefs, current: string[], i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !current[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pinStr = pin.join("");
    const confirmStr = confirmPin.join("");
    if (pinStr.length !== 6) { setError("Enter a complete 6-digit PIN"); return; }
    if (pinStr !== confirmStr) { setError("PINs do not match"); return; }
    if (username.length < 3) { setError("Username must be at least 3 characters"); return; }
    if (nickname.length < 2) { setError("Nickname must be at least 2 characters"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.toLowerCase().trim(), pin: pinStr, nickname: nickname.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Registration failed"); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glow rounded-3xl p-10">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-white mb-3">You're Registered!</h2>
            <p className="text-gray-300 mb-2">
              Welcome, <span className="text-yellow-400 font-bold">{nickname}</span>!
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Your account is pending approval from the admin. Once approved, you can start making predictions!
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-300">
              ⏳ Check back soon — the admin will review your request shortly.
            </div>
            <Link href="/login" className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold">
              🔐 Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const PinRow = ({
    label, current, refs, setter, tabOffset = 0
  }: {
    label: string;
    current: string[];
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    setter: React.Dispatch<React.SetStateAction<string[]>>;
    tabOffset?: number;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-3">{label}</label>
      <div className="flex gap-2 justify-center">
        {current.map((digit, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            tabIndex={tabOffset + i + 1}
            onChange={e => handlePinChange(refs, setter, current, i, e.target.value)}
            onKeyDown={e => handlePinKeyDown(refs, current, i, e)}
            className="pin-input"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-black text-white mb-1">Join WC2026</h1>
          <p className="text-gray-400">Create your account to start predicting</p>
        </div>

        <div className="card-glow rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                placeholder="your_username"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 font-medium"
                style={{background:"rgba(255,255,255,0.06)",border:"2px solid rgba(255,215,0,0.2)"}}
                onFocus={e => e.target.style.borderColor = "#FFD700"}
                onBlur={e => e.target.style.borderColor = "rgba(255,215,0,0.2)"}
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, used to log in</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Nickname / Display Name</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="⚽ The Predictor"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 font-medium"
                style={{background:"rgba(255,255,255,0.06)",border:"2px solid rgba(255,215,0,0.2)"}}
                onFocus={e => e.target.style.borderColor = "#FFD700"}
                onBlur={e => e.target.style.borderColor = "rgba(255,215,0,0.2)"}
                maxLength={30}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Shown on the leaderboard</p>
            </div>

            <PinRow label="Choose a 6-Digit PIN" current={pin} refs={pinRefs} setter={setPin} tabOffset={2} />
            <PinRow label="Confirm PIN" current={confirmPin} refs={confirmRefs} setter={setConfirmPin} tabOffset={8} />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 rounded-xl text-lg font-bold">
              {loading ? "Registering..." : "🚀 Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-400 font-semibold hover:text-yellow-300">Sign in</Link>
          </p>
          <p className="text-center mt-2">
            <Link href="/" className="text-gray-500 text-xs hover:text-gray-400">← Back to home</Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
          🔒 Your PIN is hashed with bcrypt — we never store it in plain text
        </div>
      </div>
    </div>
  );
}
