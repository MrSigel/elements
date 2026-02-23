import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAdminToken } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!isValidAdminToken(token)) {
    redirect("/auth?next=/admin");
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#e2e8f0]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#0d1220]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L14 4.5V8.5C14 11.5 11.5 14.3 8 14.8C4.5 14.3 2 11.5 2 8.5V4.5L8 1.5Z" stroke="#f43f5e" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M5.5 8.5L7 10L10.5 6.5" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-wider uppercase text-[#e2e8f0]">Admin Panel</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase tracking-wider">Internal</span>
        </div>
        <AdminLogoutButton />
      </header>

      {/* Page content */}
      <main className="p-6">{children}</main>
    </div>
  );
}

function AdminLogoutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="text-xs text-[#64748b] hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10"
      >
        Sign Out
      </button>
    </form>
  );
}
