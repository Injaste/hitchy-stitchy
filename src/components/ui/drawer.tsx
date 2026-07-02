import * as React from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

import { cn } from "@/lib/utils";
import { Z } from "@/lib/z-index";

// Bottom drawer with swipe-to-dismiss, built on framer-motion (already a project
// dep). Rendered inline (no portal) so it inherits the consumer's scoped CSS
// variables — e.g. a wedding template's --xx-* palette. radix Dialog drawers
// don't support drag-to-close; vaul would, but portals to <body> and loses the
// scoped theme, so framer is the better fit here.

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const DrawerContext = React.createContext<DrawerContextValue | null>(null);
const useDrawer = () => {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer components must be used within <Drawer>");
  return ctx;
};

function Drawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DrawerContext.Provider>
  );
}

// Drag past this downward offset (or fling faster than this velocity) to close.
const CLOSE_OFFSET = 120;
const CLOSE_VELOCITY = 500;

function DrawerContent({
  className,
  children,
  showHandle = true,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & {
  showHandle?: boolean;
  children?: React.ReactNode;
}) {
  const { open, onOpenChange } = useDrawer();

  // Lock body scroll + close on Escape while open.
  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) {
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-slot="drawer-overlay"
            style={{ zIndex: Z.drawer }}
            className="fixed inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            data-slot="drawer-content"
            role="dialog"
            aria-modal="true"
            style={{
              paddingBottom: "env(safe-area-inset-bottom)",
              zIndex: Z.drawer,
            }}
            className={cn(
              "fixed inset-x-0 bottom-0 mx-auto flex max-h-[88svh] w-full max-w-md touch-none flex-col rounded-t-2xl border-t bg-popover text-popover-foreground shadow-2xl",
              className,
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            {...props}
          >
            {showHandle && (
              <div
                data-slot="drawer-handle"
                className="mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 cursor-grab rounded-full bg-current opacity-25 active:cursor-grabbing"
              />
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1 p-5 pb-2 text-center", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2.5 p-5 pt-2", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn("text-lg font-medium", className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="drawer-description"
      className={cn("text-sm opacity-70", className)}
      {...props}
    />
  );
}

function DrawerClose({ className, ...props }: React.ComponentProps<"button">) {
  const { onOpenChange } = useDrawer();
  return (
    <button
      type="button"
      data-slot="drawer-close"
      onClick={() => onOpenChange(false)}
      className={className}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
