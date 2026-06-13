"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EMOJIS = [
  "⚽","🏆","🥇","🔥","⚡","💎","🦁","🐉","🦅","🐺",
  "🎯","🏹","💥","🌟","✨","🚀","👑","🎭","🤩","😎",
  "🥶","😤","🤑","🫡","💪","🧠","👻","🤖","🎪","🎸",
  "🌈","🌊","🌙","☀️","❄️","🎲","🃏","🎰","🎮","🕹️"
];

const COLORS = [
  "#7c3aed","#2563eb","#059669","#dc2626","#d97706",
  "#db2777","#0891b2","#65a30d","#ea580c","#4f46e5",
  "#0f172a","#1e293b","#7f1d1d","#14532d","#1e3a5f",
];

const TEAMS = [
  {flag:"🇧🇷",name:"Brazil"},{flag:"🇦🇷",name:"Argentina"},{flag:"🇫🇷",name:"France"},
  {flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",name:"England"},{flag:"🇪🇸",name:"Spain"},{flag:"🇩🇪",name:"Germany"},
  {flag:"🇵🇹",name:"Portugal"},{flag:"🇳🇱",name:"Netherlands"},{flag:"🇧🇪",name:"Belgium"},
  {flag:"🇺🇾",name:"Uruguay"},{flag:"🇨🇷",name:"Croatia"},{flag:"🇲🇽",name:"Mexico"},
  {flag:"🇺🇸",name:"USA"},{flag:"🇯🇵",name:"Japan"},{flag:"🇲🇦",name:"Morocco"},
  {flag:"🇸🇳",name:"Senegal"},{flag:"🇰🇷",name:"South Korea"},{flag:"🇦🇺",name:"Australia"},
  {flag:"🇨🇦",name:"Canada"},{flag:"🇶🇦",name:"Qatar"},{flag:"🇨🇭",name:"Switzerland"},
  {flag:"🇵🇱",name:"Poland"},{flag:"🇩🇰",name:"Denmark"},{flag:"🇸🇦",name:"Saudi Arabia"},
];

interface Props {
  userId: string; nickname: string; username: string;
  currentAvatar: string; currentTeam: string; currentColor: string;
}

export default function ProfileEditor({ nickname, username, currentAvatar, currentTeam, currentColor }: Props) {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [team, setTeam] = useState(currentTeam);
  const [color, setColor] = useState(currentColor || "#7c3aed");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const previewBg = color;
  const displayAvatar = avatar || nickname[0].toUpperCase();

  const save = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar, supportedTeam: team, avatarColor: color }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-black text-white">🎨 Your Profile</h1>

      {/* Live preview */}
      <div className="card-glow rounded-3xl p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 border-white/10 shadow-2xl"
            style={{background: previewBg}}
          >
            {avatar || <span className="text-white font-black text-3xl">{nickname[0].toUpperCase()}</span>}
          </div>
          {team && (
            <div className="absolute -bottom-1 -right-1 text-2xl bg-gray-900 rounded-full p-0.5 border-2 border-gray-700">
              {team}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="font-black text-white text-xl">{nickname}</div>
          <div className="text-gray-400 text-sm">@{username}</div>
        </div>
      </div>

      {/* Emoji picker */}
      <div className="card-glow rounded-3xl p-6">
        <h3 className="font-black text-white mb-1">⚡ Pick Your Avatar Emoji</h3>
        <p className="text-xs text-gray-400 mb-4">This shows on leaderboard and your profile</p>
        <div className="grid grid-cols-10 gap-1.5">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setAvatar(avatar === e ? "" : e)}
              className={`text-2xl p-1.5 rounded-xl transition-all hover:scale-110 ${
                avatar === e ? "bg-yellow-400/25 ring-2 ring-yellow-400 scale-110" : "hover:bg-white/5"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        {avatar && (
          <button onClick={() => setAvatar("")} className="mt-3 text-xs text-gray-500 hover:text-gray-300">
            ✕ Clear emoji (use initial instead)
          </button>
        )}
      </div>

      {/* Color picker */}
      <div className="card-glow rounded-3xl p-6">
        <h3 className="font-black text-white mb-1">🎨 Avatar Background Color</h3>
        <p className="text-xs text-gray-400 mb-4">Pick a vibe that matches your energy</p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-4 transition-all hover:scale-110 ${
                color === c ? "border-white scale-110 shadow-lg" : "border-transparent"
              }`}
              style={{background: c}}
            />
          ))}
        </div>
      </div>

      {/* Team support */}
      <div className="card-glow rounded-3xl p-6">
        <h3 className="font-black text-white mb-1">🌍 Which Team Are You Supporting?</h3>
        <p className="text-xs text-gray-400 mb-4">Shows as a badge on your avatar</p>
        <div className="grid grid-cols-4 gap-2">
          {TEAMS.map(t => (
            <button
              key={t.name}
              onClick={() => setTeam(team === t.flag ? "" : t.flag)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                team === t.flag
                  ? "bg-yellow-400/20 ring-2 ring-yellow-400"
                  : "hover:bg-white/5"
              }`}
            >
              <span className="text-2xl">{t.flag}</span>
              <span className="text-xs text-gray-400 leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving || saved}
        className="btn-gold w-full py-4 rounded-2xl text-lg font-black"
      >
        {saved ? "✅ Saved!" : saving ? "Saving..." : "💾 Save Profile"}
      </button>
    </div>
  );
}
