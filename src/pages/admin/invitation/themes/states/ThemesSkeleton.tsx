import { Skeleton } from "@/components/ui/skeleton"

const ThemesSkeleton = () => (
  <div className="p-3 space-y-2">
    <Skeleton className="h-[60px] rounded-xl" />
    <Skeleton className="h-[60px] rounded-xl" />
    <Skeleton className="h-[60px] rounded-xl" />
  </div>
)

export default ThemesSkeleton
