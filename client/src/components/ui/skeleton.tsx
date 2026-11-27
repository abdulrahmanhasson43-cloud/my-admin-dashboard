import { cn } from "@/lib/utils";

/** Shimmer placeholder — used instead of a spinner everywhere. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("shimmer rounded-lg", className)} />;
}

export function PosterSkeleton() {
  return (
    <div className="w-[168px] shrink-0 sm:w-[196px]">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="mt-3 h-3.5 w-4/5" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="rail" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <PosterSkeleton key={i} />
      ))}
    </div>
  );
}
