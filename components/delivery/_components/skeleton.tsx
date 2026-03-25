// components/delivery/_components/skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while time slots are loading for a selected date */
export function SlotGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

/** Shown while the whole form is initialising */
export function FormSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="w-7 h-7 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-1 w-full rounded-full" />
      </div>
      {/* Title */}
      <Skeleton className="h-7 w-2/3 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-lg" />
      {/* Inputs */}
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      {/* Nav */}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}