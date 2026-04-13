import { Skeleton } from "@/components/ui/skeleton"

const TasksSkeleton = () => (
  <div className="space-y-8">
    {[0, 1].map((g) => (
      <div key={g} className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default TasksSkeleton
