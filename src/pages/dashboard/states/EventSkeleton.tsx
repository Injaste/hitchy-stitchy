const EventSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-2xl border border-border flex flex-col animate-pulse"
        >
          {/* Card header area */}
          <div className="px-6 pt-6 pb-0 flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="w-16 h-5 rounded-full bg-muted" />
          </div>

          {/* Card content area */}
          <div className="px-6 pt-4 pb-6 flex flex-col flex-1 gap-0">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2 mt-2" />
            <div className="h-3 bg-muted rounded w-1/4 mt-1.5" />
            <div className="flex flex-col sm:flex-row gap-2 mt-5">
              <div className="flex-1 h-8 bg-muted rounded-lg" />
              <div className="h-8 bg-muted rounded-lg sm:w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventSkeleton;
