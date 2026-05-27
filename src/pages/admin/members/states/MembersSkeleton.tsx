import { Skeleton } from "@/components/ui/skeleton"

const MembersSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[0, 1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-20 w-full rounded-xl" />
    ))}
  </div>
)

export default MembersSkeleton
