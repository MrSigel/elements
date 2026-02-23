import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FrontpageManager } from "@/components/forms/FrontpageManager";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";
import { getChannelPlan } from "@/lib/plan";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function UpgradeGate() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="max-w-sm text-center space-y-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#a855f7" strokeWidth="1.6" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#a855f7" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-text">Enterprise Feature</h2>
            <p className="text-sm text-subtle mt-2">
              Viewer pages are available on the Enterprise plan. Upgrade to create shareable URLs your chat can open during streams.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            Upgrade to Enterprise
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

export default async function FrontpagesPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return (
      <DashboardShell>
        <p className="text-subtle">Unauthorized.</p>
      </DashboardShell>
    );
  }

  const plan = await getChannelPlan(auth.user.id);
  if (plan !== "enterprise") {
    return <UpgradeGate />;
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();
  const [{ data: pages }, { data: overlays }] = channelIds.length
    ? await Promise.all([
        admin.from("viewer_pages").select("id,page_type,enabled,viewer_tokens(public_token)").in("channel_id", channelIds).order("created_at", { ascending: false }),
        admin.from("overlays").select("id,name").in("channel_id", channelIds).order("created_at", { ascending: false })
      ])
    : [{ data: [] as never[] }, { data: [] as never[] }];

  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-black text-text">Viewer Pages</h1>
          <p className="text-sm text-subtle mt-1">Create public viewer pages your chat can open during a stream — bonus hunt trackers, tournament scoreboards, slot request lists, and more.</p>
        </div>
        <FrontpageManager overlays={overlays ?? []} pages={(pages ?? []) as never[]} />
      </div>
    </DashboardShell>
  );
}
