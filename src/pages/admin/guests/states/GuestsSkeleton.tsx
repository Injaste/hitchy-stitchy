import { Skeleton } from "@/components/ui/skeleton"

const GuestsSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[72px] rounded-xl" />
      ))}
    </div>

    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      <Skeleton className="h-3 w-16 ml-auto rounded" />

      <div className="rounded-xl border border-border overflow-hidden">
        <Skeleton className="h-10 w-full rounded-none" />
        <div className="flex flex-col">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[60px] w-full rounded-none border-t border-border" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default GuestsSkeleton
