export default function Loading() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden>
      <div className="h-3 w-32 bg-line" />
      <div className="h-12 w-2/3 bg-line" />
      <div className="h-4 w-1/2 bg-mist" />
      <div className="h-44 bg-mist" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 bg-mist" />
        <div className="h-28 bg-mist" />
        <div className="h-28 bg-mist" />
      </div>
    </div>
  );
}
