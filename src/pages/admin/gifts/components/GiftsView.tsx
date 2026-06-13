import { useMemo, useState } from "react";
import type { FC } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";
import { Input } from "@/components/ui/input";
import DayTabs from "@/pages/admin/components/DayTabs";
import { dayLabel } from "@/pages/admin/days/utils";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { useBudgetQuery } from "../../budget/queries";
import { dayBudgetTotal, grandBudget } from "../../budget/utils";
import { useGiftModalStore } from "../hooks/useGiftModalStore";
import { computeGiftSummary, giftsForDay, grandTotal, sortGifts } from "../utils";
import type { GiftsData } from "../api";

import GiftsOverview from "./GiftsOverview";
import GiftsSummary from "./GiftsSummary";
import GiftsSheet from "./GiftsSheet";
import GiftsSkeleton from "../states/GiftsSkeleton";
import GiftsEmpty from "../states/GiftsEmpty";

interface GiftsViewProps {
  data?: GiftsData;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const GiftsView: FC<GiftsViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useGiftModalStore((s) => s.openCreate);
  const openEditItem = useGiftModalStore((s) => s.openEditItem);
  const { canCreate } = useAccess();

  const { days, activeDayId, setActiveDay } = useActiveEventDay();

  const [search, setSearch] = useState("");

  const gifts = data?.gifts ?? [];

  // Gifts drive their own rail: only days that actually have a gift appear
  // (unlike budget, which shows every day). The global active day is the source
  // of truth — but if it has no gifts, we *display* the first gift-day instead,
  // without touching global. Selecting a tile updates global (DayTabs onSelect).
  const giftDays = useMemo(() => {
    const withGifts = new Set(gifts.map((g) => g.day_id));
    return days.filter((d) => withGifts.has(d.id));
  }, [days, gifts]);
  const giftMultiDay = giftDays.length > 1;

  const effectiveDayId = giftDays.some((d) => d.id === activeDayId)
    ? activeDayId
    : (giftDays[0]?.id ?? null);
  const effectiveDay = days.find((d) => d.id === effectiveDayId);
  const effectiveIndex = days.findIndex((d) => d.id === effectiveDayId);

  // Tally gifts against the budget total (the per-day caps) — the same reference
  // budget itself uses. No budget set → null → the break-even strip hides.
  const { data: budget } = useBudgetQuery();
  const totalCost = useMemo(
    () => grandBudget(budget?.buckets ?? []),
    [budget],
  );
  const dayCost = useMemo(
    () => dayBudgetTotal(budget?.buckets ?? [], effectiveDayId),
    [budget, effectiveDayId],
  );

  // Whole wedding: every gift against the total budget.
  const globalSummary = useMemo(
    () => computeGiftSummary(gifts, totalCost),
    [gifts, totalCost],
  );

  // The selected day: only its gifts + its budget.
  const dayGifts = useMemo(
    () => giftsForDay(gifts, effectiveDayId),
    [gifts, effectiveDayId],
  );
  const daySummary = useMemo(
    () => computeGiftSummary(dayGifts, dayCost),
    [dayGifts, dayCost],
  );
  const scopeLabel = giftMultiDay
    ? dayLabel(effectiveDay?.label, effectiveIndex)
    : undefined;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = dayGifts.filter(
      (gift) =>
        !q ||
        gift.given_by.toLowerCase().includes(q) ||
        (gift.notes ?? "").toLowerCase().includes(q),
    );
    return sortGifts(matched);
  }, [dayGifts, search]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <ComponentFade key="skeleton" useBlur>
          <GiftsSkeleton />
        </ComponentFade>
      );
    }

    if (isError || !data) {
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your gift envelopes. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content" useBlur>
        <div className="space-y-4">
          {/* Whole-wedding roll-up — only when gifts span >1 day. */}
          {giftMultiDay && (
            <GiftsOverview summary={globalSummary} dayCount={giftDays.length} />
          )}

          {/* Rail shows only gift-days; selecting one updates the global day. */}
          <DayTabs
            days={giftDays}
            activeDayId={effectiveDayId}
            onSelect={setActiveDay}
          />

          {/* Switching days blur-swaps the day's hero + sheet; the overview +
              day rail above stay put. */}
          <AnimatePresence mode="wait">
            <ComponentFade key={effectiveDayId ?? "none"} useBlur>
              <div className="space-y-4">
                <GiftsSummary summary={daySummary} scopeLabel={scopeLabel} />

                <AnimatePresence mode="wait" initial={false}>
                  {dayGifts.length === 0 ? (
                    <ComponentFade key="empty" useBlur>
                      <GiftsEmpty
                        onAdd={openCreate}
                        canCreate={canCreate("gifts")}
                      />
                    </ComponentFade>
                  ) : (
                    <ComponentFade key="rows" useBlur>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or notes…"
                            className="rounded-full pl-9"
                          />
                        </div>

                        <GiftsSheet
                          gifts={filtered}
                          total={grandTotal(filtered)}
                          onRowClick={openEditItem}
                        />
                      </div>
                    </ComponentFade>
                  )}
                </AnimatePresence>
              </div>
            </ComponentFade>
          </AnimatePresence>
        </div>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default GiftsView;
