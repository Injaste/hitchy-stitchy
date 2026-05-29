import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[0, 1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-48 w-full rounded-2xl" />
    ))}
  </div>
);

export default DashboardSkeleton;
