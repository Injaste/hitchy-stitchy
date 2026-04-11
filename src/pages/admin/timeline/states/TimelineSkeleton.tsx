import { Skeleton } from "@/components/ui/skeleton";

const SlotSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="flex gap-3 overflow-hidden">
        <div className="shrink-0 w-72 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="shrink-0 w-72 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const TimelineSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Day tab pills */}
      <div className="flex gap-2 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-14 w-20 rounded-md shrink-0" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>

      {/* Label group skeletons */}
      <div className="space-y-10">
        <SlotSkeleton />
        <SlotSkeleton />
      </div>
    </div>
  );
};

export default TimelineSkeleton;
