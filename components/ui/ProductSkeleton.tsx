export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="aspect-[4/5] bg-slate-200 rounded-xl" />
      <div className="px-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}
