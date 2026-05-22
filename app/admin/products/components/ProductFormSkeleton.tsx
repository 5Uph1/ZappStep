export function ProductFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="h-10 bg-slate-200 rounded-lg w-48 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-64 mt-2 animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
        {/* Gambar skeleton */}
        <div>
          <div className="h-3 bg-slate-200 rounded w-32 mb-2 animate-pulse" />
          <div className="w-32 h-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 bg-slate-200 rounded-lg w-48 mt-3 animate-pulse" />
        </div>

        {/* Nama skeleton */}
        <div>
          <div className="h-3 bg-slate-200 rounded w-40 mb-2 animate-pulse" />
          <div className="h-12 bg-slate-200 rounded-lg w-full animate-pulse" />
        </div>

        {/* Deskripsi skeleton */}
        <div>
          <div className="h-3 bg-slate-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-lg w-full animate-pulse" />
        </div>

        {/* Harga & Kategori skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
            <div className="h-12 bg-slate-200 rounded-lg w-full animate-pulse" />
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
            <div className="h-12 bg-slate-200 rounded-lg w-full animate-pulse" />
          </div>
        </div>

        {/* Variants skeleton */}
        <div>
          <div className="flex justify-between mb-3">
            <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
            <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-1 h-12 bg-slate-200 rounded-lg animate-pulse" />
                <div className="w-28 h-12 bg-slate-200 rounded-lg animate-pulse" />
                <div className="w-10 h-12 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-3 pt-2">
          <div className="flex-1 h-12 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex-1 h-12 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
