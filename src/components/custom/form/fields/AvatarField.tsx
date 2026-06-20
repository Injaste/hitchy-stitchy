import { useRef, type ChangeEvent, type ReactNode } from "react";
import { Camera, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

interface AvatarFieldProps {
  /** The avatar element to display (caller supplies — keeps this presentational
   *  and free of any profile/account data dependency). */
  preview: ReactNode;
  /** Called with the picked file; the caller owns the upload + feedback. */
  onSelectFile: (file: File) => void;
  isPending?: boolean;
  accept?: string;
  /** Accessible name for the trigger (the avatar is the button). */
  label?: string;
  helpText?: ReactNode;
  className?: string;
}

/**
 * Avatar upload control, social-media style: the avatar IS the button. A camera
 * badge marks it editable (visible on touch, not just hover); clicking it opens
 * the file picker, it dims on hover/focus, and a spinner takes over while
 * uploading. Presentational — the caller passes the preview and handles the file
 * (see account AvatarUploader, which wires the profile query + upload mutation).
 */
const AvatarField = ({
  preview,
  onSelectFile,
  isPending = false,
  accept = DEFAULT_ACCEPT,
  label = "Change photo",
  helpText,
  className,
}: AvatarFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked after a failed try
    if (file) onSelectFile(file);
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label={label}
        aria-busy={isPending || undefined}
        className="group/photo relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer disabled:cursor-default"
      >
        {preview}

        {/* Dim scrim — subtle on hover/focus, full while uploading. */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full text-white transition-opacity",
            isPending
              ? "bg-foreground/55 opacity-100"
              : "bg-foreground/35 opacity-0 group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100",
          )}
        >
          <Loader2
            className={cn(
              "size-5 transition-opacity",
              isPending ? "animate-spin opacity-100" : "opacity-0",
            )}
          />
        </span>

        {/* Always-visible affordance badge — reads as editable on touch too.
            Fades out while the upload spinner takes over. */}
        <span
          className={cn(
            "pointer-events-none absolute right-0 bottom-0 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background transition-opacity",
            isPending ? "opacity-0" : "opacity-100",
          )}
        >
          <Camera className="size-3" />
        </span>
      </button>

      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default AvatarField;
