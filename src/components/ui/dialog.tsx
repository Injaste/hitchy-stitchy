"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion, type AnimationDefinition } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { itemShake } from "@/lib/animations";
import { ScrollView, type ScrollViewProps } from "../custom/scroll-view";

type DialogAction = {
  label: string;
  onClick: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      data-lenis-prevent
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  animate = "idle",
  onAnimationComplete,
  nested = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  /**
   * This dialog opens ON TOP of another one. Keeps the overlay (Radix needs it
   * for scroll lock) but drops its tint and blur — the dialog underneath already
   * dims the page, and stacking two would double both, reading as a much darker
   * scrim than either modal asked for.
   */
  nested?: boolean;
  /**
   * Drives the framer-motion variant on the inner visual card. Default
   * `"idle"`. Pass `"shake"` to trigger the blocked-close shake, then use
   * `onAnimationComplete` to reset to `"idle"`. Mirrors AlertDialog.
   */
  animate?: "idle" | "shake";
  onAnimationComplete?: (definition: AnimationDefinition) => void;
}) {
  return (
    <DialogPortal>
      <DialogOverlay
        className={
          nested
            ? "bg-transparent supports-backdrop-filter:backdrop-blur-none"
            : undefined
        }
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full px-4 max-w-full -translate-x-1/2 -translate-y-1/2 outline-none data-open:animate-in data-open:fade-in-0 data-open:blur-in data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:blur-out data-closed:zoom-out-95 sm:max-w-md",
          className,
        )}
        {...props}
      >
        <motion.div
          className="relative grid gap-4 rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 has-data-[slot=dialog-close]:**:data-[slot=dialog-title]:pr-8 h-full"
          variants={itemShake}
          animate={animate}
          onAnimationComplete={onAnimationComplete}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close data-slot="dialog-close" asChild>
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 pt-4 px-4", className)}
      {...props}
    />
  );
}

function DialogBody({ className, children, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      mainClass="py-px"
      gradientTop
      gradientBottom
      gradientClass="from-popover"
      className={cn("max-h-[50vh] px-4", className)}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 rounded-b-xl px-4 pb-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogDetailActions({
  destructive = [],
  primary,
}: {
  destructive?: (DialogAction | false | null | undefined)[];
  primary?: DialogAction | false | null;
}) {
  const items = destructive.filter(Boolean) as DialogAction[];
  const hasDestructive = items.length > 0;

  return (
    <DialogFooter>
      {hasDestructive && (
        <div className="flex gap-2 [&_button]:flex-1">
          {items.map((a) => (
            <Button
              key={a.label}
              variant={a.variant ?? "destructive"}
              size="sm"
              onClick={a.onClick}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
      {hasDestructive && primary && (
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
      )}
      {primary && (
        <Button size="sm" onClick={primary.onClick} autoFocus>
          {primary.label}
        </Button>
      )}
    </DialogFooter>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "cn-font-heading font-display text-base leading-none font-medium",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-xs text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogDetailActions,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
export type { DialogAction };
