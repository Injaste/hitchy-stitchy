import { useEffect, useState, type FC } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import PortalToApp from "@/components/custom/portal-to-app";

import { itemFadeIn } from "@/lib/animations";
import type { EventsCount } from "../types";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  eventsCount: EventsCount;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const COOLDOWN_MS = 10_000; // 10 seconds

const DashboardHeader: FC<DashboardHeaderProps> = ({
  eventsCount,
  isLoading,
  isFetching,
  refetch,
}) => {
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cooldownRemaining = lastRefreshed
    ? Math.max(0, COOLDOWN_MS - (now - lastRefreshed))
    : 0;

  const canRefresh = !isFetching && cooldownRemaining === 0;

  const handleRefresh = () => {
    if (!canRefresh) return;
    refetch();
    setLastRefreshed(Date.now());
  };

  return (
    <div className="flex not-md:flex-col gap-4 justify-between items-start">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">
          Your events
        </p>
        <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
          Planning Dashboard
        </h1>
      </div>

      {!isLoading && (
        <motion.div
          variants={itemFadeIn}
          className="flex flex-row-reverse items-end gap-4"
        >
          <PortalToApp>
            <Link
              to="/create-event"
              className="fixed bottom-4 right-4 sm:hidden z-50"
            >
              <Button size="icon-xl" className="rounded-full shadow-lg">
                <Plus />
              </Button>
            </Link>
          </PortalToApp>

          <div className="flex gap-2 not-sm:hidden">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground"
              onClick={handleRefresh}
              disabled={!canRefresh}
            >
              <RefreshCw
                className={cn("size-3.5", isFetching && "animate-spin")}
              />
            </Button>
            <Link to="/create-event">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" />
                New event
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-right">
            {eventsCount.active > 0 && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Active
                  </p>
                  <p className="text-lg font-bold font-serif text-foreground leading-none">
                    {eventsCount.active}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
              </>
            )}
            {eventsCount.upcoming > 0 && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Upcoming
                  </p>
                  <p className="text-lg font-bold font-serif text-foreground leading-none">
                    {eventsCount.upcoming}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHeader;
