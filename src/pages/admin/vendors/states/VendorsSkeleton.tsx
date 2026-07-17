import { Skeleton } from "@/components/ui/skeleton"

// Mirrors VendorsView's real frame so the swap doesn't shift the layout: same
// search pill (h-9), same @container grid + gap, and a card block sized to the
// real card (measured 259px -> h-64, the nearest step on the scale).
const VendorsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-9 w-full rounded-full" />
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
)

export default VendorsSkeleton
