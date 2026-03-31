import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  onCancel: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  submitLabel: string;
  isPending?: boolean;
}

export function ModalFooter({ onCancel, onDelete, deleteLabel = "Delete", submitLabel, isPending }: Props) {
  return (
    <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
      {onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          className="w-full sm:w-auto mb-2 sm:mb-0"
        >
          {deleteLabel}
        </Button>
      )}
      <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </Button>
      </div>
    </DialogFooter>
  );
}
