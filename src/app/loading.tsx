export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-10 w-2/3 rounded-2xl bg-panel-2" />
      <div className="h-5 w-1/2 rounded-full bg-panel-2" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-56 rounded-3xl bg-panel" />
        <div className="h-56 rounded-3xl bg-panel" />
        <div className="h-56 rounded-3xl bg-panel" />
      </div>
    </div>
  );
}
