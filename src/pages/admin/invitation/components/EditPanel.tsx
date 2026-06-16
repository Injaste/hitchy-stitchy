import { forwardRef, useImperativeHandle, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MoreHorizontal, RotateCcw, EyeOff, Trash2, Undo2 } from "lucide-react";
import { ScrollView } from "@/components/custom/scroll-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import SubmitButton from "@/components/custom/form/SubmitButton";
import ComponentFade from "@/components/animations/animate-component-fade";
import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { FormShellContext } from "@/components/custom/form/form-context";

import ThemeSheetForm from "../themes/editor/components/ThemeSheetForm";
import RSVPSection from "../config/sections/RSVPSection";
import GuestLimitsSection from "../config/sections/GuestLimitsSection";
import FormFieldsSection from "../config/sections/FormFieldsSection";
import ConfirmationSection from "../config/sections/ConfirmationSection";
import { RSVP_FIELD_KEYS } from "../config/components/ConfigsForm";
import { useInvitationEditForm } from "../hooks/useInvitationEditForm";
import type { EventInvitation } from "../types";

export interface EditPanelHandle {
  attemptClose: () => void;
}

interface EditPanelProps {
  invitation: EventInvitation;
  onClose: () => void;
}

type Tab = "design" | "rsvp";

// Presentational left pane (edit mode). One <form> spans both tabs (design +
// RSVP) so Enter / Ctrl-Enter saves and validation is unified. Save persists the
// draft (+ live RSVP settings); Publish promotes the draft to the live page.
const EditPanel = forwardRef<EditPanelHandle, EditPanelProps>(
  ({ invitation, onClose }, ref) => {
    const {
      entry,
      form,
      attemptCount,
      isDirty,
      isPending,
      isSuccess,
      isError,
      validate,
      commitSave,
      commitPublish,
      attemptClose,
      modal,
      isPublished,
      hasUnpublishedChanges,
      canPublish,
      handleUnpublish,
      handleDelete,
      resetToTemplate,
      discardChanges,
      publishPending,
      publishSuccess,
      publishError,
      unpublishPending,
      unpublishSuccess,
      unpublishError,
      deletePending,
      deleteSuccess,
      deleteError,
    } = useInvitationEditForm(invitation, onClose);

    const [tab, setTab] = useState<Tab>("design");
    const [confirm, setConfirm] = useState<
      null | "reset" | "unpublish" | "delete" | "publish" | "discard"
    >(null);

    useImperativeHandle(ref, () => ({ attemptClose }), [attemptClose]);

    // Confirm dialogs close themselves once their mutation succeeds (after the
    // SubmitButton's success tick). Delete also closes the sheet.
    useCloseOnSuccess(publishSuccess, () => setConfirm(null));
    useCloseOnSuccess(unpublishSuccess, () => setConfirm(null));
    useCloseOnSuccess(deleteSuccess, () => {
      setConfirm(null);
      onClose();
    });

    // Validate; if blocked, jump to the tab holding the first error. Returns OK.
    const validateAndJump = () => {
      const bad = validate();
      if (!bad) return true;
      setTab(RSVP_FIELD_KEYS.has(bad) ? "rsvp" : "design");
      return false;
    };

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateAndJump()) commitSave().catch(() => {});
    };

    // Publish is confirmed first; only open the dialog once the form is valid.
    const onPublish = () => {
      if (validateAndJump()) setConfirm("publish");
    };

    const inFlight = isPending || publishPending;

    // Ctrl/Cmd-Enter saves from a textarea (plain Enter inserts a newline there;
    // in single-line inputs Enter already submits via the submit button).
    const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.currentTarget.requestSubmit();
      }
    };

    const statusText = isDirty
      ? "Unsaved changes"
      : !isPublished
        ? "Draft"
        : hasUnpublishedChanges
          ? "Unpublished changes"
          : "Published";

    return (
      <FormShellContext.Provider
        value={{ attemptCount, form, isPending, isSuccess, isError }}
      >
        <div className="flex flex-col min-h-0 h-full">
          {/* Fixed tab bar — centered tabs (flex-balanced) with the overflow menu
              at the far right. Kept OUTSIDE the form so triggers don't submit;
              controlled so a blocked save can jump to the errored tab. */}
          <div className="flex items-center border-b bg-muted/40 px-3 py-3">
            <div className="flex-1" />
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as Tab)}
              className="w-full max-w-xs shrink-0"
            >
              <TabsList className="w-full">
                <TabsTrigger value="design" className="flex-1 text-xs">
                  Design
                </TabsTrigger>
                <TabsTrigger value="rsvp" className="flex-1 text-xs">
                  RSVP
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-1 justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {isDirty && (
                    <DropdownMenuItem onSelect={() => setConfirm("discard")}>
                      <Undo2 className="size-4" />
                      Discard changes
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => setConfirm("reset")}>
                    <RotateCcw className="size-4" />
                    Reset to template
                  </DropdownMenuItem>
                  {isPublished && (
                    <DropdownMenuItem onSelect={() => setConfirm("unpublish")}>
                      <EyeOff className="size-4" />
                      Unpublish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setConfirm("delete")}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* One form spans both tabs (fields + Save/Publish). */}
          <form
            onSubmit={submit}
            onKeyDown={onKeyDown}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                <ComponentFade key={tab} className="h-full min-h-0">
                  <ScrollView gradientTop gradientBottom className="px-4 py-5">
                    {tab === "design" ? (
                      <div className="space-y-4">
                        {entry ? (
                          <ThemeSheetForm
                            key={invitation.id}
                            schema={entry.schema}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground px-1">
                            This template isn't available.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <RSVPSection />
                        <GuestLimitsSection />
                        <FormFieldsSection />
                        <ConfirmationSection />
                      </div>
                    )}
                  </ScrollView>
                </ComponentFade>
              </AnimatePresence>
            </div>

            <Separator />
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
                  disabled={!isDirty || inFlight}
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
                  disabled={!canPublish || inFlight}
                >
                  Publish
                </Button>
              </div>
            </div>
          </form>

          {modal}

          <ConfirmAlertModal
            open={confirm === "publish"}
            onOpenChange={(o) => !o && setConfirm(null)}
            variant="default"
            title={isPublished ? "Publish changes?" : "Publish invitation?"}
            description={
              isPublished
                ? "This updates the live page your guests see with your current design."
                : "This makes the page live — anyone with the link can open it."
            }
            confirmLabel="Publish"
            isPending={publishPending}
            isSuccess={publishSuccess}
            isError={publishError}
            onConfirm={() => commitPublish().catch(() => {})}
          />
          <ConfirmAlertModal
            open={confirm === "discard"}
            onOpenChange={(o) => !o && setConfirm(null)}
            variant="warning"
            title="Discard changes?"
            description="Your unsaved edits will be lost and the design reverts to the last save."
            confirmLabel="Discard"
            onConfirm={() => {
              discardChanges();
              setConfirm(null);
            }}
          />
          <ConfirmAlertModal
            open={confirm === "reset"}
            onOpenChange={(o) => !o && setConfirm(null)}
            variant="warning"
            title="Reset to template?"
            description="This replaces your current design draft with the template's defaults. RSVP settings are untouched, and you'll still need to Save."
            confirmLabel="Reset"
            onConfirm={() => {
              resetToTemplate();
              setConfirm(null);
            }}
          />
          <ConfirmAlertModal
            open={confirm === "unpublish"}
            onOpenChange={(o) => !o && setConfirm(null)}
            variant="warning"
            title="Unpublish invitation?"
            description="Guests will no longer be able to open the page. You can publish again anytime."
            confirmLabel="Unpublish"
            isPending={unpublishPending}
            isSuccess={unpublishSuccess}
            isError={unpublishError}
            onConfirm={handleUnpublish}
          />
          <ConfirmAlertModal
            open={confirm === "delete"}
            onOpenChange={(o) => !o && setConfirm(null)}
            variant="destructive"
            title="Delete invitation?"
            description={
              isPublished
                ? "Unpublish this invitation before deleting it."
                : "This permanently removes the invitation and its design. This can't be undone."
            }
            confirmLabel="Delete"
            confirmDisabled={isPublished}
            isPending={deletePending}
            isSuccess={deleteSuccess}
            isError={deleteError}
            onConfirm={handleDelete}
          />
        </div>
      </FormShellContext.Provider>
    );
  },
);

EditPanel.displayName = "EditPanel";

export default EditPanel;
