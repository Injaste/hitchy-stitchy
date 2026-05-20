import { useEffect, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { itemFadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";

import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { cn } from "@/lib/utils";

interface LabelTabsProps {
  labels: string[];
  activeLabel: string;
  onSelect: (label: string) => void;
}

const LabelTabs: FC<LabelTabsProps> = ({ labels, activeLabel, onSelect }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  const labelsKey = labels.join("|");
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, labelsKey]);

  return (
    <div className="relative -mx-1">
      <div ref={emblaRef} className="overflow-hidden p-1">
        <div className="flex gap-2">
          {labels.map((label) => {
            const active = label === activeLabel;
            return (
              <Button
                key={label}
                onClick={() => onSelect(label)}
                variant={active ? "default" : "outline"}
                className={cn(
                  "h-auto! py-1.5 px-3 lg:py-2.5 lg:px-5",
                  !active && "bg-background",
                )}
              >
                <span className="font-display text-sm font-medium">
                  {label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showLeftFade && (
          <motion.div
            key="left"
            variants={itemFadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background to-transparent flex items-center"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Scroll labels left"
              className="pointer-events-auto size-7 rounded-full ml-1 shadow-sm backdrop-blur-sm"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </motion.div>
        )}

        {showRightFade && (
          <motion.div
            key="right"
            variants={itemFadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background to-transparent flex items-center justify-end"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Scroll labels right"
              className="pointer-events-auto size-7 rounded-full mr-1 shadow-sm backdrop-blur-sm"
            >
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabelTabs;
