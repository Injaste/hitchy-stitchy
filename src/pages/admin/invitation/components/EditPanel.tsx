import { forwardRef, useImperativeHandle, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ScrollView } from "@/components/custom/scroll-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ComponentFade from "@/components/animations/animate-component-fade";
import { FormShellContext } from "@/components/custom/form/form-context";

import ThemeSheetForm from "../themes/editor/components/ThemeSheetForm";
import RSVPSection from "../config/sections/RSVPSection";
import GuestLimitsSection from "../config/sections/GuestLimitsSection";
import FormFieldsSection from "../config/sections/FormFieldsSection";
import ConfirmationSection from "../config/sections/ConfirmationSection";
import { RSVP_FIELD_KEYS } from "../config/components/ConfigsForm";
import { useInvitationEditForm } from "../hooks/useInvitationEditForm";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import EditFooter from "./EditFooter";
import EditOverflowMenu from "./EditOverflowMenu";
import InvitationModals from "../modals";
import type { Invitation } from "../types";

export interface EditPanelHandle {
  attemptClose: () => void;
}

interface EditPanelProps {
  invitation: Invitation;
  onClose: () => void;
}

type Tab = "design" | "rsvp";

// Coordinator for the edit pane: owns the form controller + tab state, and wires
// the tab bar (+ overflow menu), the form body, the footer, and the confirm
// modals. Presentation lives in the extracted components.
const EditPanel = forwardRef<EditPanelHandle, EditPanelProps>(
  ({ invitation, onClose }, ref) => {
    const edit = useInvitationEditForm(invitation, onClose);
    const openConfirm = useInvitationModalStore((s) => s.openConfirm);

    const [tab, setTab] = useState<Tab>("design");

    useImperativeHandle(ref, () => ({ attemptClose: edit.attemptClose }), [
      edit.attemptClose,
    ]);

    // Validate; if blocked, jump to the tab holding the first error. Returns OK.
    const validateAndJump = () => {
      const bad = edit.validate();
      if (!bad) return true;
      setTab(RSVP_FIELD_KEYS.has(bad) ? "rsvp" : "design");
      return false;
    };

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateAndJump()) edit.commitSave().catch(() => {});
    };

    // Publish is confirmed first; only open the dialog once the form is valid.
    const onPublish = () => {
      if (validateAndJump()) openConfirm("publish");
    };

    // Scheduled publish: validate, then publish with a future timestamp (the
    // popover is the confirmation). Returns false when invalid so the popover
    // closes and the errored tab is shown.
    const onSchedule = (publishAt: string): boolean => {
      if (!validateAndJump()) return false;
      edit.commitPublish(publishAt).catch(() => {});
      return true;
    };

    // Ctrl/Cmd-Enter saves from a textarea (plain Enter inserts a newline there;
    // in single-line inputs Enter already submits via the submit button).
    const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.currentTarget.requestSubmit();
      }
    };

    const statusText = edit.isDirty
      ? "Unsaved changes"
      : !edit.isPublished
        ? "Draft"
        : edit.isScheduled && edit.scheduledAt
          ? `Scheduled for ${format(parseISO(edit.scheduledAt), "d MMM, h:mm a")}`
          : edit.hasUnpublishedChanges
            ? "Unpublished changes"
            : "Published";

    return (
      <FormShellContext.Provider
        value={{
          attemptCount: edit.attemptCount,
          form: edit.form,
          isPending: edit.isPending,
          isSuccess: edit.isSuccess,
          isError: edit.isError,
        }}
      >
        <div className="flex flex-col min-h-0 h-full">
          {/* Fixed tab bar — centered tabs (flex-balanced) with the overflow menu
              at the far right. Kept OUTSIDE the form so triggers don't submit;
              controlled so a blocked save can jump to the errored tab. */}
          <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-3">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as Tab)}
              className="flex-1"
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
            <EditOverflowMenu isDirty={edit.isDirty} />
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
                        {edit.entry ? (
                          <ThemeSheetForm
                            key={invitation.id}
                            schema={edit.entry.schema}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground px-1">
                            This template isn't available.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <RSVPSection
                          linkSlug={invitation.link_slug}
                          published={edit.isLive}
                        />
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
            <EditFooter
              statusText={statusText}
              canPublish={edit.canPublish}
              isDirty={edit.isDirty}
              hasUnpublishedChanges={edit.hasUnpublishedChanges}
              busy={edit.isPending || edit.publishPending}
              isPending={edit.isPending}
              isSuccess={edit.isSuccess}
              isError={edit.isError}
              isLive={edit.isLive}
              isScheduled={edit.isScheduled}
              isPublished={edit.isPublished}
              publishPending={edit.publishPending}
              publishSuccess={edit.publishSuccess}
              publishError={edit.publishError}
              onPublish={onPublish}
              onSchedule={onSchedule}
            />
          </form>

          {edit.modal}
          <InvitationModals edit={edit} onSheetClose={onClose} />
        </div>
      </FormShellContext.Provider>
    );
  },
);

EditPanel.displayName = "EditPanel";

export default EditPanel;
