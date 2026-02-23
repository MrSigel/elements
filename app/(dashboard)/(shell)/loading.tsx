export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/[0.06]" />
      <div className="h-4 w-80 rounded-md bg-white/[0.04]" />
      <div className="grid gap-4 mt-8">
        <div className="h-24 rounded-xl bg-white/[0.04]" />
        <div className="h-24 rounded-xl bg-white/[0.04]" />
        <div className="h-24 rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  );
}
