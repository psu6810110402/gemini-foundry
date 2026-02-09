import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-slate-200 dark:bg-slate-700",
        className,
      )}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Skeleton className="h-6 w-1/3" />

      {/* Paragraph */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-2 mt-6">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Mermaid diagram placeholder */}
      <div className="mt-6">
        <Skeleton className="h-5 w-1/4 mb-3" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>

      {/* More content */}
      <div className="space-y-2 mt-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/2 mb-2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
