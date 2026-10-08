export function TileSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="text-sm font-medium">Loading…</span>
      </div>
      <div className="w-3/4 h-3/4 bg-bg/50 rounded-xl animate-pulse" />
    </div>
  );
}