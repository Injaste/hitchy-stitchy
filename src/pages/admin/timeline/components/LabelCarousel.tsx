import { useEffect, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { itemFadeUp } from "@/lib/animations";

import type { Timeline } from "../types";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useActiveTimelineQuery } from "../queries";
import TimelineCard from "./TimelineCard";

interface LabelCarouselProps {
  items: Timeline[];
  /** All items in the day — for each card's live/next-up lifecycle. */
  dayItems: Timeline[];
}

/** Horizontal carousel of the cards in one label group. */
const LabelCarousel: FC<LabelCarouselProps> = ({ items, dayItems }) => {
  const { data: active } = useActiveTimelineQuery();
  const activeIndex = items.findIndex((i) => i.id === active?.id);

  // Start centered on the live card when this group holds it (mirrors the day
  // tabs landing on today); embla owns scrolling/drag from there.
  const { emblaRef, emblaApi } = useEmblaCarouselApi(
    "center",
    activeIndex < 0 ? undefined : activeIndex,
  );
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  // Re-center on the live card when the active item changes (startIndex only
  // covers the initial mount). On mount it targets the index startIndex already
  // set, so it's a no-op; embla handles an in-progress drag itself.
  useEffect(() => {
    if (!emblaApi || activeIndex < 0) return;
    emblaApi.scrollTo(activeIndex);
  }, [emblaApi, activeIndex]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden p-1">
        <div className="flex gap-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                custom={i}
                variants={itemFadeUp}
                initial="hidden"
                animate="show"
                exit="hidden"
                layout
                className="shrink-0 w-[calc(100%-4rem)] 2xs:w-[calc(100%-5rem)] xs:w-[calc(100%-6rem)] sm:w-72 self-stretch"
              >
                <TimelineCard item={item} dayItems={dayItems} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-8 2xs:w-10 xs:w-12 bg-linear-to-r from-background to-transparent transition-opacity"
        style={{ opacity: showLeftFade ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 2xs:w-10 xs:w-12 bg-linear-to-l from-background to-transparent transition-opacity"
        style={{ opacity: showRightFade ? 1 : 0 }}
      />
    </div>
  );
};

export default LabelCarousel;
