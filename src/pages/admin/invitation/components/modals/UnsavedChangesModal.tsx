import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesModalProps {
  open: boolean;
  isSaving: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

const UnsavedChangesModal = ({
  open,
  isSaving,
  onContinue,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onContinue()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            Save your edits, discard them, or keep editing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            variant="ghost"
            size="sm"
            onClick={onContinue}
            disabled={isSaving}
          >
            Continue editing
          </AlertDialogCancel>
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
          >
            Discard
          </Button>
          <AlertDialogAction size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesModal;
