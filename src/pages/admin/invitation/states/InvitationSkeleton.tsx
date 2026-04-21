import { Skeleton } from "@/components/ui/skeleton";

const InvitationSkeleton = () => {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-[440px] rounded-xl" />
      </div>
      <Skeleton className="h-[620px] rounded-2xl" />
    </div>
  );
};

export default InvitationSkeleton;
