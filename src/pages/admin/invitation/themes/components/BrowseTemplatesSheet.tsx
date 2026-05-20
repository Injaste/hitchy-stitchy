import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollView } from "@/components/custom/scroll-view";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import BrowseTemplatesGallery from "./BrowseTemplatesGallery";
import type { TemplateTheme } from "../../types";

interface BrowseTemplatesSheetProps {
  templates: TemplateTheme[];
  open: boolean;
  onClose: () => void;
  onEdit: (themeId: string) => void;
}

const BrowseTemplatesSheet = ({
  templates,
  open,
  onClose,
  onEdit,
}: BrowseTemplatesSheetProps) => {
  const isCreateOpen = useInvitationModalStore((s) => s.isCreateOpen);

  useEffect(() => {
    if (open && isCreateOpen) onClose();
  }, [open, isCreateOpen, onClose]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="!max-w-2xl w-full p-0 gap-0"
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-lg">Browse templates</SheetTitle>
          <SheetDescription>
            Pick a template to start a new theme.
          </SheetDescription>
        </SheetHeader>
        <ScrollView className="flex-1">
          <div className="p-6">
            <BrowseTemplatesGallery templates={templates} onEdit={onEdit} />
          </div>
        </ScrollView>
      </SheetContent>
    </Sheet>
  );
};

export default BrowseTemplatesSheet;
