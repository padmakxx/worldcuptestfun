import { getSession, getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileEditor from "./ProfileEditor";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const user = await getUser(session.userId);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href="/dashboard" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </nav>
      <ProfileEditor
        userId={user.id}
        nickname={user.nickname}
        username={user.username}
        currentAvatar={user.avatar || ""}
        currentTeam={user.supportedTeam || ""}
        currentColor={user.avatarColor || ""}
      />
    </div>
  );
}
