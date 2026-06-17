import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePreviewScale, PHONE_W, PHONE_H } from "../hooks/usePreviewScale";

interface PhonePreviewProps {
  children: ReactNode;
  className?: string;
}

// Shared phone frame for the invitation previews (browse + edit). Fixed width
// that grows to fill the pane height (capped) so it scales to fit the viewport —
// 400×867 @ 0.9 scale, dropping below 0.9 on phones too narrow for the 0.9 box.
const PhonePreview = ({ children, className }: PhonePreviewProps) => {
  const scale = usePreviewScale();
  return (
    <div
      style={{
        width: Math.round(PHONE_W * scale),
        maxHeight: Math.round(PHONE_H * scale),
      }}
      className={cn(
        "shrink-0 min-h-0 flex-1 overflow-hidden rounded-2xl border bg-background shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default PhonePreview;
