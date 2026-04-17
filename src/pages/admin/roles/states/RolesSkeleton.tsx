import { Skeleton } from "@/components/ui/skeleton"

const RolesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[0, 1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-44 w-full rounded-xl" />
    ))}
  </div>
)

export default RolesSkeleton
