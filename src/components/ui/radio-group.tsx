import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { fieldRing } from "@/components/ui/field-styles";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio peer relative flex aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-input bg-transparent outline-none after:absolute after:-inset-x-3 after:-inset-y-2",
        "transition-[transform,box-shadow] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        fieldRing,
        className,
      )}
      {...props}
    >
      {/* The filled state is one piece: a primary overlay (covering the ring)
          fades in via opacity. Once it lands, the dot pops on top — and the
          whole thing reverses on deselect. */}
      <RadioGroupPrimitive.Indicator
        forceMount
        data-slot="radio-group-indicator"
        className={cn(
          "absolute -inset-px flex items-center justify-center rounded-full bg-primary",
          "opacity-0 transition-opacity ease-out group-data-[state=checked]/radio:opacity-100",
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full bg-primary-foreground",
            "scale-0 transition-transform ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[state=checked]/radio:delay-150 group-data-[state=checked]/radio:scale-100",
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
