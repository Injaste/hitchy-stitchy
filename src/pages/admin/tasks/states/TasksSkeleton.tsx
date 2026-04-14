import { Skeleton } from "@/components/ui/skeleton"

const TasksSkeleton = () => (
  <div className="space-y-10">
    {[0, 1].map((g) => (
      <div key={g} className="space-y-4">
        {/* Section header */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-2.5 w-20" />
          <div className="flex-1 h-px bg-border/40" />
          <Skeleton className="h-2.5 w-4" />
        </div>

        {/* Task cards — match px-5 py-4 dimensions */}
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default TasksSkeleton
