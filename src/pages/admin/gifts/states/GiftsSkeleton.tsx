import { Skeleton } from "@/components/ui/skeleton"

const GiftsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-44 rounded-2xl" />
    <Skeleton className="h-9 w-full rounded-full" />
    <div className="overflow-hidden rounded-xl border border-border">
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="flex flex-col">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-14 w-full rounded-none border-t border-border"
          />
        ))}
      </div>
    </div>
  </div>
)

export default GiftsSkeleton
