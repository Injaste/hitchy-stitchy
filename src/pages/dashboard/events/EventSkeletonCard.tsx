const SkeletonCard = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="w-20 h-6 rounded-full bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4 mt-1" />
      </div>
      <div className="flex gap-2 mt-auto">
        <div className="flex-1 h-8 bg-muted rounded-lg" />
        <div className="w-20 h-8 bg-muted rounded-lg" />
      </div>
    </div>
  );
};

export default SkeletonCard;
