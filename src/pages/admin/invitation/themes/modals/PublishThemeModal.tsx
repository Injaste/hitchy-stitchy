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
import { Globe } from "lucide-react";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";

const PublishThemeModal = () => {
  const isPublishOpen = useInvitationModalStore((s) => s.isPublishOpen);
  const selectedItem = useInvitationModalStore((s) => s.selectedItem);
  const closeAll = useInvitationModalStore((s) => s.closeAll);
  const { publish } = useThemesMutations();

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
          <AlertDialogAction
            size="sm"
            onClick={handleConfirm}
            disabled={publish.isPending}
          >
            {publish.isPending ? "Publishing..." : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishThemeModal;
