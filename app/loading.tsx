export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navbar Skeleton */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-64px)] animate-pulse">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="p-4">
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="px-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl"
              />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6 animate-pulse">
          {/* Tabs Skeleton */}
          <div className="flex gap-4 mb-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl"
              />
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>

              {/* Upload Area */}
              <div className="h-40 w-full bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 mb-6" />

              {/* Input Area */}
              <div className="space-y-4">
                <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
