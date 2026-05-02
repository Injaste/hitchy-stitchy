import { type FC } from "react";
import { motion } from "framer-motion";

import { itemFadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";

interface LabelTabsProps {
  labels: string[];
  activeLabel: string;
  onSelect: (label: string) => void;
}

const LabelTabs: FC<LabelTabsProps> = ({ labels, activeLabel, onSelect }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  return (
    <div className="mb-6 -mx-1">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            {labels.map((label) => {
              const active = label === activeLabel;
              return (
                <Button
                  key={label}
                  onClick={() => onSelect(label)}
                  variant={active ? "default" : "outline"}
                  className="h-auto! py-1.5 px-3 lg:py-2.5 lg:px-5"
                >
                  <span className="font-display text-sm font-medium">
                    {label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {showLeftFade && (
          <motion.div
            variants={itemFadeIn}
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent"
          />
        )}

        {showRightFade && (
          <motion.div
            variants={itemFadeIn}
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent"
          />
        )}
      </div>
      <Separator className="mt-6" />
    </div>
  );
};

export default LabelTabs;
