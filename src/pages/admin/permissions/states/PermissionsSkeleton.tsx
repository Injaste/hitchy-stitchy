import { Skeleton } from "@/components/ui/skeleton";

const PermissionsSkeleton = () => (
  <div className="rounded-xl border border-border/60 overflow-hidden">
    <div className="border-b border-border/60 bg-muted/40 px-5 py-3.5 flex gap-4">
      <Skeleton className="h-4 w-[36%]" />
      <Skeleton className="h-4 w-[21%]" />
      <Skeleton className="h-4 w-[21%]" />
      <Skeleton className="h-4 w-[21%]" />
    </div>
    <div className="divide-y divide-border/30">
      {[...Array(11)].map((_, i) => (
        <div key={i} className="px-5 py-3.5 flex gap-4 items-center">
          <Skeleton className="h-3.5 w-[36%]" />
          <Skeleton className="h-3.5 w-[10%]" />
          <Skeleton className="h-3.5 w-[10%]" />
          <Skeleton className="h-3.5 w-[10%]" />
        </div>
      ))}
    </div>
  </div>
);

export default PermissionsSkeleton;
