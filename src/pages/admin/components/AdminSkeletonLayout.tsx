import { Skeleton } from '@/components/ui/skeleton'

const AdminSkeletonLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="w-64 border-r border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col p-6 gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl mt-2" />
      </div>
    </div>
  )
}

export default AdminSkeletonLayout
