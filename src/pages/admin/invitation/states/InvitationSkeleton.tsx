import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the hub: a section heading over a grid of invitation tiles.
const InvitationSkeleton = () => (
  <div className="@container space-y-4">
    <div className="px-1 space-y-2">
      <Skeleton className="h-3 w-28 rounded" />
      <Skeleton className="h-4 w-72 max-w-full rounded" />
    </div>
    <div className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 gap-4">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

export default InvitationSkeleton;
