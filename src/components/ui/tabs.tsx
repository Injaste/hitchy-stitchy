import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import useIndicatorSlider from "@/lib/hooks/useIndicatorSlider";
import ComponentFade from "../animations/animate-component-fade";

interface TabsIndicatorContextValue {
  setRef: (id: string) => (el: HTMLElement | null) => void;
  onMouseEnter: (id: string) => void;
}

const TabsIndicatorContext =
  React.createContext<TabsIndicatorContextValue | null>(null);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// Hoists TabsContent panels and renders them through a single AnimatePresence so
// only one panel is ever mounted during a transition — no double-render on switch.

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = isControlled ? value : internalValue;

  const handleValueChange = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternalValue(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  // Separate TabsContent panels from other children (TabsList, etc.)
  const panels: { value: string; content: React.ReactNode }[] = [];
  const rest: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement<{ value: string; children?: React.ReactNode }>(child) &&
      child.type === TabsContent
    ) {
      panels.push({ value: child.props.value, content: child.props.children });
    } else {
      rest.push(child);
    }
  });

  const activePanel = panels.find((p) => p.value === activeValue);

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      className={cn("gap-2 group/tabs flex data-horizontal:flex-col", className)}
      {...props}
    >
      {rest}
      <AnimatePresence mode="wait">
        {activePanel && (
          <ComponentFade key={activeValue}>
            {activePanel.content}
          </ComponentFade>
        )}
      </AnimatePresence>
    </TabsPrimitive.Root>
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
  const {
    containerRef,
    hoverIndicatorRef,
    activeIndicatorRef,
    setRef,
    onMouseEnter,
    onMouseLeave,
  } = useIndicatorSlider("horizontal", activeValue);

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
            className="absolute top-1 bottom-1 bg-secondary/70 rounded-md z-0 pointer-events-none"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        {/* Hover slider */}
        <motion.div
          ref={hoverIndicatorRef}
          className="absolute top-1 bottom-1 bg-secondary/40 rounded-md z-0 pointer-events-none opacity-0"
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
        "gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer active:bg-secondary",
        "group-data-[variant=line]/tabs-list:bg-transparent text-muted-foreground data-active:text-secondary-foreground",
        "z-10",
        className,
      )}
      {...props}
    />
  );
}

// ─── TabsContent ──────────────────────────────────────────────────────────────
// Pure marker — Tabs hoists its children into a single AnimatePresence above.
// This component itself renders nothing.

function TabsContent(_props: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return null;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
