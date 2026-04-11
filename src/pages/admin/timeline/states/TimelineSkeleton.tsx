import { Skeleton } from "@/components/ui/skeleton";

const SlotSkeleton = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-12 shrink-0" />
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="pl-4 space-y-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
};

const TimelineSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Day tab pills */}
      <div className="flex gap-2 overflow-hidden">
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
      </div>

      {/* Slot skeletons */}
      <div className="space-y-6">
        <SlotSkeleton />
        <SlotSkeleton />
      </div>
    </div>
  );
};

export default TimelineSkeleton;
