import { Fragment, useState } from "react";

import { TextareaAutosaveField } from "@/components/custom/form";
import { BASE_URL } from "@/lib/config";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import {
  useInviteMessageQuery,
  useUpdateInviteMessageMutation,
} from "@/pages/admin/members/queries";
import {
  renderInviteMessage,
  validateInviteMessage,
  findUnknownPlaceholders,
  INVITE_MESSAGE,
} from "@/pages/admin/members/utils";

const MAX_LENGTH = 500;
const INSERTABLES = ["{member}", "{event}", "{link}"];
// Sentinel substituted for {link} in the preview, then split on so the sample
// link renders as an element rather than raw text.
const LINK_MARKER = String.fromCharCode(0xE000);

// Manager-only editor for the per-event member-invite share text. Autosaves like
// the other settings fields (Profile, Day labels) via TextareaAutosaveField. The
// field is pre-filled with the effective message so the default is directly
// editable; saving the exact default stores NULL (follow the code default).
const InviteMessageSection = () => {
  const { slug, eventName, memberDisplayName } = useAdminStore();
  const { data: saved } = useInviteMessageQuery();
  const save = useUpdateInviteMessageMutation();

  // null/undefined (no override, or still loading) → the code default.
  const effective = saved ?? INVITE_MESSAGE;
  // Mirrors the field's live value (via onValueChange) so the preview updates as
  // you type — TextareaAutosaveField owns the value; this is a read-only echo.
  const [previewValue, setPreviewValue] = useState(effective);

  const sampleLink = `${BASE_URL}/${slug}/join?token=…`;
  const unknown = findUnknownPlaceholders(previewValue);
  const previewParts = renderInviteMessage(previewValue, {
    member: memberDisplayName,
    event: eventName,
    link: LINK_MARKER,
  }).split(LINK_MARKER);

  return (
    <div className="space-y-4">
      <TextareaAutosaveField
        id="invite-message"
        label="Invite message"
        description={
          <>
            Shown when you share a join link with a new member. Optional:{" "}
            <code className="text-foreground">{"{member}"}</code> (their name),{" "}
            <code className="text-foreground">{"{event}"}</code> (the event).
            Required: <code className="text-foreground">{"{link}"}</code> — where
            the join link goes.
          </>
        }
        saved={effective}
        maxLength={MAX_LENGTH}
        rows={3}
        insertables={INSERTABLES}
        validate={validateInviteMessage}
        onValueChange={setPreviewValue}
        // Exact default collapses to NULL so it keeps following the code default.
        onSave={(v) => save.mutate(v === INVITE_MESSAGE ? "" : v)}
      />

      {unknown.length > 0 && (
        <p className="text-2xs text-warning">
          Unknown placeholder{unknown.length > 1 ? "s" : ""}{" "}
          <span className="font-mono">{unknown.join(", ")}</span> will be sent
          as-is.
        </p>
      )}

      <div className="rounded-md bg-muted px-3 py-2.5 space-y-1">
        <p className="text-2xs uppercase tracking-wide text-muted-foreground">
          Preview
        </p>
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
          {previewParts.map((part, i) => (
            <Fragment key={i}>
              {part}
              {i < previewParts.length - 1 && (
                <span className="break-all text-primary">{sampleLink}</span>
              )}
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};

export default InviteMessageSection;
