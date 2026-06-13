"use client";
import { useState } from "react";

export default function ResetPinButton({ userId, nickname }: { userId: string; nickname: string }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    if (!/^\d{6}$/.test(pin)) { setMsg("PIN must be exactly 6 digits"); return; }
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/reset-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newPin: pin }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg(`✅ PIN reset to ${pin} — tell ${nickname}`);
      setPin("");
      setOpen(false);
    } else {
      const d = await res.json();
      setMsg(d.error || "Failed");
    }
  };

  return (
    <div className="border-t border-white/5 pt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-500/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          🔑 Reset PIN
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="New 6-digit PIN"
            className="px-3 py-1.5 rounded-lg text-sm text-white w-36"
            style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)"}}
          />
          <button
            onClick={handleReset}
            disabled={loading}
            className="btn-gold px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => { setOpen(false); setPin(""); setMsg(""); }}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5"
          >
            Cancel
          </button>
          {msg && <span className="text-xs text-emerald-400 w-full mt-1">{msg}</span>}
        </div>
      )}
    </div>
  );
}
