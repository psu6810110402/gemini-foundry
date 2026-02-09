export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto p-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
