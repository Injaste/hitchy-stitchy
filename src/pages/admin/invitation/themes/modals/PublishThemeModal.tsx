import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { Globe } from "lucide-react";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";

const PublishThemeModal = () => {
  const isPublishOpen = useInvitationModalStore((s) => s.isPublishOpen);
  const selectedItem = useInvitationModalStore((s) => s.selectedItem);
  const closeAll = useInvitationModalStore((s) => s.closeAll);
  const { publish } = useThemesMutations();

  useCloseOnSuccess(publish.isSuccess, closeAll);

  if (!selectedItem) return null;
  const theme = selectedItem;

  const handleConfirm = () => publish.mutate(theme.id);

  return (
    <AlertDialog open={isPublishOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4 shrink-0" />
            Publish theme
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Publishing{" "}
            <span className="font-semibold text-foreground">
              "{theme.name}"
            </span>{" "}
            will make it visible to your guests. Any previously published theme
            will be unpublished.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={publish.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <SubmitButton
            type="button"
            size="sm"
            onClick={handleConfirm}
            isPending={publish.isPending}
            isSuccess={publish.isSuccess}
            isError={publish.isError}
          >
            Publish
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishThemeModal;
