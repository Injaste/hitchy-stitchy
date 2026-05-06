import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DialogBody, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";

const CreateThemeModal = () => {
  const isCreateOpen = useInvitationModalStore((s) => s.isCreateOpen);
  const selectedTemplateId = useInvitationModalStore(
    (s) => s.selectedTemplateId,
  );
  const closeAll = useInvitationModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useThemesMutations();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedTemplateId) return;
    create.mutate({
      event_id: eventId!,
      template_id: selectedTemplateId,
      name: name.trim(),
    });
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name your theme</DialogTitle>
          <DialogDescription>
            Give this theme a name so you can identify it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <Field className="gap-2">
              <FieldLabel>Theme name</FieldLabel>
              <FieldContent>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Invitation"
                  autoFocus
                />
              </FieldContent>
            </Field>
          </DialogBody>
          <Separator />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={closeAll}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              {create.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThemeModal;
