import { getSession, getAllUsers, getUser, saveUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ approve?: string; deny?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  const { approve, deny } = await searchParams;

  // Handle approve/deny
  if (approve) {
    const user = await getUser(approve);
    if (user) { user.approved = true; await saveUser(user); }
    redirect("/admin/users");
  }
  if (deny) {
    const user = await getUser(deny);
    if (user) { user.approved = false; await saveUser(user); }
    redirect("/admin/users");
  }

  const users = await getAllUsers();
  const pending = users.filter(u => !u.approved);
  const approved = users.filter(u => u.approved);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href="/admin" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-white">← Admin</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-8">👥 Manage Users</h1>

        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">⏳ Pending ({pending.length})</h2>
            <div className="space-y-3">
              {pending.map(u => (
                <div key={u.id} className="card-glow rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{u.nickname}</div>
                    <div className="text-sm text-gray-400">@{u.username} · {new Date(u.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`?approve=${u.id}`} className="btn-gold px-4 py-2 rounded-xl text-sm font-bold">✅ Approve</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-emerald-400 mb-4">✅ Approved ({approved.length})</h2>
          <div className="space-y-3">
            {approved.map(u => (
              <div key={u.id} className="card-glow rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-black">
                    {u.nickname[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">{u.nickname}</div>
                    <div className="text-sm text-gray-400">@{u.username}</div>
                  </div>
                </div>
                <Link href={`?deny=${u.id}`} className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-lg">
                  Revoke
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
