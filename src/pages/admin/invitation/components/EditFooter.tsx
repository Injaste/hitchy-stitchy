import { memo } from "react";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { Button } from "@/components/ui/button";

interface EditFooterProps {
  statusText: string;
  canPublish: boolean;
  isDirty: boolean;
  busy: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  onPublish: () => void;
}

// Status (inline dot) + Save-as-draft (submits the form) + Publish (opens the
// publish confirm). Memoised: only re-renders when these focused props change.
const EditFooter = memo(
  ({
    statusText,
    canPublish,
    isDirty,
    busy,
    isPending,
    isSuccess,
    isError,
    onPublish,
  }: EditFooterProps) => (
    <div className="flex items-center justify-between gap-2 p-4 bg-background">
      <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        {canPublish && (
          <span className="size-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
        )}
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
        <Button
          type="button"
          size="sm"
          onClick={onPublish}
          disabled={!canPublish || busy}
        >
          Publish
        </Button>
      </div>
    </div>
  ),
);

EditFooter.displayName = "EditFooter";

export default EditFooter;
