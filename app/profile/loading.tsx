export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-pulse">
        {/* Profile Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />

            {/* Info */}
            <div className="flex-1 space-y-6 text-center md:text-left w-full">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="space-y-2">
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
