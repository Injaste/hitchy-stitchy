import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          // Tailwind's Preflight resets every <button> to a transparent
          // background + inherited text colour, which silently wins over
          // Sonner's own [data-button] rule — hence the !important overrides.
          // bg-current ties the pill to whichever accent is inherited (Sonner
          // sets it per toast type — success/error/warning/info), instead of a
          // flat neutral tint that clashes with the type colour.
          actionButton: "!bg-current/10 hover:!bg-current/20 !text-current transition-colors",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
