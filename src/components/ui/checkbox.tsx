import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";
import { fieldRing } from "@/components/ui/field-styles";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer group relative size-4 shrink-0 cursor-pointer rounded-sm border border-input bg-transparent outline-none",
      "transition-[transform,box-shadow] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
      fieldRing,
      className,
    )}
    {...props}
  >
    {/* The filled state is one piece: a primary overlay (covering the box and
        its border) that fades in via opacity. Once it lands, the check draws on
        top — and the whole thing reverses on uncheck. */}
    <CheckboxPrimitive.Indicator
      forceMount
      className={cn(
        "absolute -inset-px flex items-center justify-center rounded-sm bg-primary text-primary-foreground",
        "opacity-0 transition-opacity ease-out",
        "group-data-[state=checked]:opacity-100 group-data-[state=indeterminate]:opacity-100",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        className="size-2.5"
      >
        {/* Check — drawn via stroke-dashoffset, delayed so the fill lands first. */}
        <path
          d="M4.5 12.75l6 6 9-13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke-dasharray:26] [stroke-dashoffset:26] transition-[stroke-dashoffset] ease-out group-data-[state=checked]:delay-150 group-data-[state=checked]:[stroke-dashoffset:0]"
        />
        {/* Indeterminate — same draw, only while the box is indeterminate. */}
        <line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          strokeLinecap="round"
          className="[stroke-dasharray:14] [stroke-dashoffset:14] transition-[stroke-dashoffset] ease-out group-data-[state=indeterminate]:delay-150 group-data-[state=indeterminate]:[stroke-dashoffset:0]"
        />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
