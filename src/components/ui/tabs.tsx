import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import useIndicatorSlider from "@/lib/hooks/useIndicatorSlider";
import ComponentSlide from "../animations/animate-component-slide";

interface TabsIndicatorContextValue {
  setRef: (id: string) => (el: HTMLElement | null) => void;
  onMouseEnter: (id: string) => void;
}

const TabsIndicatorContext =
  React.createContext<TabsIndicatorContextValue | null>(null);

type TabsDirection = 1 | -1 | 0;

interface TabsDirectionContextValue {
  direction: TabsDirection;
}

const TabsDirectionContext = React.createContext<TabsDirectionContextValue>({
  direction: 0,
});

function Tabs({
  className,
  orientation = "horizontal",
  tabOrder,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  tabOrder?: string[] | readonly string[];
}) {
  // 0 = no directional slide (initial mount), 1 = forward, -1 = backward
  const [direction, setDirection] = React.useState<TabsDirection>(0);

  const prevValueRef = React.useRef<string | undefined>(value ?? defaultValue);
  // Stays false until the user actually clicks a tab
  const hasInteracted = React.useRef(false);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (newValue === prevValueRef.current) return;

      hasInteracted.current = true;

      if (tabOrder && prevValueRef.current) {
        const prevIdx = tabOrder.indexOf(prevValueRef.current);
        const nextIdx = tabOrder.indexOf(newValue);
        if (prevIdx !== -1 && nextIdx !== -1) {
          let sign: TabsDirection = 1;
          if (nextIdx < prevIdx) sign = -1;
          setDirection(sign);
        }
      }

      prevValueRef.current = newValue;
      onValueChange?.(newValue);
    },
    [tabOrder, onValueChange],
  );

  return (
    <TabsDirectionContext.Provider value={{ direction }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(
          "gap-2 group/tabs flex data-horizontal:flex-col",
          className,
        )}
        {...props}
      />
    </TabsDirectionContext.Provider>
  );
}
// ─── TabsList ─────────────────────────────────────────────────────────────────

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "gap-1 bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  activeValue,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    activeValue?: string;
  }) {
  const { containerRef, hoverIndicatorRef, activeIndicatorRef, setRef, onMouseEnter, onMouseLeave } =
    useIndicatorSlider("horizontal", activeValue);

  return (
    <TabsIndicatorContext.Provider value={{ setRef, onMouseEnter }}>
      <TabsPrimitive.List
        ref={containerRef as React.Ref<HTMLDivElement>}
        data-slot="tabs-list"
        data-variant={variant}
        onMouseLeave={onMouseLeave}
        className={cn(tabsListVariants({ variant }), "relative", className)}
        {...props}
      >
        {/* Active slider */}
        {activeValue && (
          <motion.div
            ref={activeIndicatorRef}
            className="absolute top-1 bottom-1 bg-primary/20 rounded-md z-0 pointer-events-none"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        {/* Hover slider */}
        <motion.div
          ref={hoverIndicatorRef}
          className="absolute top-1 bottom-1 bg-background/50 rounded-md z-0 pointer-events-none opacity-0"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        {props.children}
      </TabsPrimitive.List>
    </TabsIndicatorContext.Provider>
  );
}

// ─── TabsTrigger ──────────────────────────────────────────────────────────────

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = React.useContext(TabsIndicatorContext);

  return (
    <TabsPrimitive.Trigger
      ref={ctx ? ctx.setRef(value) : undefined}
      onMouseEnter={ctx ? () => ctx.onMouseEnter(value) : undefined}
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent",
        "z-10",
        className,
      )}
      {...props}
    />
  );
}

// ─── TabsContent ──────────────────────────────────────────────────────────────
// Direction is read from TabsDirectionContext — no prop needed on the consumer.
// `value` is used as the TabWrapper key so the animation re-fires every time
// Radix mounts this panel (= every time this tab becomes active).

function TabsContent({
  value,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const { direction } = React.useContext(TabsDirectionContext);

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      value={value}
      className={cn("text-sm flex-1 outline-none", className)}
      {...props}
    >
      <AnimatePresence mode="wait">
        <ComponentSlide key={value} direction={direction}>
          {props.children}
        </ComponentSlide>
      </AnimatePresence>
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
