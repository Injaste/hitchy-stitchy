import { useEffect } from "react";
import { useStore } from "@tanstack/react-form";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, DateField, TimeField, TextField, TextareaField } from "@/components/custom/form";
import { useFormShell } from "@/components/custom/form/form-context";
import ShareLink from "@/components/custom/share-link";
import { BASE_URL } from "@/lib/config";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { RSVP_MODES, type RSVPMode } from "../../types";
import { RSVP_MODE_META } from "../../rsvpMeta";

const RSVP_MODE_OPTIONS = RSVP_MODES.map((m) => {
  const Icon = RSVP_MODE_META[m].icon;
  return {
    value: m,
    label: RSVP_MODE_META[m].label,
    icon: <Icon className="size-4 shrink-0 text-muted-foreground" />,
  };
});

// Mode-specific helper text under the picker — explains behaviour and (for `both`)
// how to preview each form face. Reads the mode live so it updates on change.
const ModeHint = () => {
  const { form } = useFormShell();
  const mode: RSVPMode = useStore(
    form.store,
    (s: any) => s.values.rsvp_mode ?? "public",
  );
  return (
    <p className="-mt-1 text-xs text-muted-foreground">
      {RSVP_MODE_META[mode].hint}
    </p>
  );
};

// A short, human-typeable shared code (no ambiguous 0/O/1/I) the couple broadcasts
// to private guests. They unlock by entering their phone + this code.
const generateCode = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

// The shared gate code — only relevant when RSVP is gated (private/both). Reads the
// mode live so it shows/hides without a remount.
const PrivateCodeFields = () => {
  const { form } = useFormShell();
  const mode: RSVPMode = useStore(
    form.store,
    (s: any) => s.values.rsvp_mode ?? "public",
  );
  if (mode === "public") return null;

  const fill = () => {
    form.setFieldValue("private_code", generateCode());
    form.setFieldMeta("private_code", (m: any) => ({
      ...m,
      isDirty: true,
      isTouched: true,
    }));
  };

  const label = (
    <span className="flex w-full items-center justify-between gap-2">
      Private code
      <button
        type="button"
        onClick={fill}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline cursor-pointer"
      >
        <Sparkles className="size-3" />
        Generate
      </button>
    </span>
  );

  return (
    <TextField
      name="private_code"
      label={label}
      placeholder="e.g. ROSE26"
      hint="Enter your own or generate one — share this code with all invited guests so they can RSVP with their phone."
    />
  );
};

// The forward-ready RSVP link for gated pages. Carries ?private=true so a `both`
// page opens the code form for reserved guests (harmless on a private page). Only
// works once the page is published — else the public URL 404s. Reads mode + code
// live so it appears/updates with the form.
const PrivateShareBlock = ({
  linkSlug,
  published,
}: {
  linkSlug: string | null;
  published: boolean;
}) => {
  const { form } = useFormShell();
  const { slug } = useAdminStore();
  const mode: RSVPMode = useStore(
    form.store,
    (s: any) => s.values.rsvp_mode ?? "public",
  );
  const code: string = useStore(
    form.store,
    (s: any) => s.values.private_code ?? "",
  );
  if (mode === "public") return null;

  const path = `${slug}${linkSlug ? `/${linkSlug}` : ""}`;
  const url = `${BASE_URL}/${path}?private=true`;
  const message = code
    ? `You're invited! RSVP with your phone and invite code ${code}:`
    : "You're invited! RSVP here:";

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-medium text-foreground">Guest RSVP link</p>
      {published ? (
        <>
          <p className="break-all text-xs text-muted-foreground">{url}</p>
          <ShareLink url={url} message={message} />
          <p className="text-xs text-muted-foreground">
            Share this link with the code above — guests unlock with their phone +
            code.
          </p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Publish this page to activate its share link.
        </p>
      )}
    </div>
  );
};

const DeadlineFields = () => {
  const { form } = useFormShell();
  const dateValue: string = useStore(
    form.store,
    (s: any) => s.values.rsvp_deadline_date ?? "",
  );

  useEffect(() => {
    const currentTime: string = form.getFieldValue("rsvp_deadline_time") ?? "";
    if (dateValue) {
      if (!currentTime) form.setFieldValue("rsvp_deadline_time", "23:59");
    } else if (currentTime) {
      form.setFieldValue("rsvp_deadline_time", "");
    }
  }, [dateValue, form]);

  const hasDate = !!dateValue;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <DateField
          name="rsvp_deadline_date"
          label="Deadline date"
          optional
          hint="Set a past date to preview the closed message."
        />
        <TimeField
          name="rsvp_deadline_time"
          label="Deadline time"
          optional={!hasDate}
        />
      </div>
      {hasDate && (
        <TextareaField
          name="deadline_message"
          label="Closed message"
          optional
          rows={2}
          placeholder="RSVP submissions are now closed. Thank you to everyone who responded."
          hint="Shown on the invitation once the deadline passes."
        />
      )}
    </>
  );
};

interface RSVPSectionProps {
  linkSlug: string | null;
  published: boolean;
}

const RSVPSection = ({ linkSlug, published }: RSVPSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
        RSVP
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <SelectField
          name="rsvp_mode"
          label="RSVP mode"
          options={RSVP_MODE_OPTIONS}
        />
        <ModeHint />
        <PrivateCodeFields />
        <PrivateShareBlock linkSlug={linkSlug} published={published} />
        <DeadlineFields />
      </FieldGroup>
    </CardContent>
  </Card>
);

export default RSVPSection;
