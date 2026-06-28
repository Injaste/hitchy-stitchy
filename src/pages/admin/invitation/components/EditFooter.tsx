import { memo } from "react";
import { CloudUpload } from "lucide-react";
import SubmitButton from "@/components/custom/form/SubmitButton";
import PublishButton from "./PublishButton";

interface EditFooterProps {
  statusText: string;
  canPublish: boolean;
  isDirty: boolean;
  hasUnpublishedChanges: boolean;
  busy: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isLive: boolean;
  isScheduled: boolean;
  isPublished: boolean;
  publishPending: boolean;
  publishSuccess: boolean;
  publishError: boolean;
  onPublish: () => void;
  onSchedule: (publishAt: string) => boolean;
}

// Status + Save-as-draft (submits the form) + Publish (opens the publish confirm).
// The status icon matches the invitation card: a CloudUpload when the live page has
// unpublished edits, else a pulsing dot while there's anything to publish.
// Memoised: only re-renders when these focused props change.
const EditFooter = memo(
  ({
    statusText,
    canPublish,
    isDirty,
    hasUnpublishedChanges,
    busy,
    isPending,
    isSuccess,
    isError,
    isLive,
    isScheduled,
    isPublished,
    publishPending,
    publishSuccess,
    publishError,
    onPublish,
    onSchedule,
  }: EditFooterProps) => (
    <div className="flex items-center justify-between gap-2 p-4 bg-background">
      <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        {hasUnpublishedChanges ? (
          <CloudUpload className="size-3.5 shrink-0 text-primary" />
        ) : canPublish ? (
          <span className="size-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
        ) : null}
        <span className="truncate">{statusText}</span>
      </span>

      <div className="flex shrink-0 items-center gap-2">
        <SubmitButton
          type="submit"
          variant="outline"
          size="sm"
          disabled={!isDirty || busy}
          isPending={isPending}
          isSuccess={isSuccess}
          isError={isError}
        >
          Save as draft
        </SubmitButton>
        <PublishButton
          canPublish={canPublish}
          busy={busy}
          isLive={isLive}
          isScheduled={isScheduled}
          isPublished={isPublished}
          publishPending={publishPending}
          publishSuccess={publishSuccess}
          publishError={publishError}
          onPublish={onPublish}
          onSchedule={onSchedule}
        />
      </div>
    </div>
  ),
);

EditFooter.displayName = "EditFooter";

export default EditFooter;
