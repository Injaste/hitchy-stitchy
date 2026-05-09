import { Skeleton } from "@/components/ui/skeleton"

const GuestsSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[72px] rounded-xl" />
      ))}
    </div>

    <div className="rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="flex flex-col">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[60px] w-full rounded-none border-t border-border" />
        ))}
      </div>
    </div>
  </div>
)

export default GuestsSkeleton
