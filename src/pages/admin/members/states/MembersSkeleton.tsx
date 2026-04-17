import { Skeleton } from "@/components/ui/skeleton"

const MembersSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-32 w-full rounded-xl" />
    ))}
  </div>
)

export default MembersSkeleton
