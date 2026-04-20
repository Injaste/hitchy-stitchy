import { Skeleton } from "@/components/ui/skeleton"

const GuestsSkeleton = () => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>

    {/* Totals strip */}
    <Skeleton className="h-12 w-full rounded-xl" />

    {/* Table */}
    <div className="rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="flex flex-col">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-none border-t border-border" />
        ))}
      </div>
    </div>
  </div>
)

export default GuestsSkeleton
