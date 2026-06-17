import type { FC } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  FormBody,
  useFormShell,
  type SelectFieldOption,
} from "@/components/custom/form";

import { guestFormSchema, STATUS_LABELS, type GuestFormValues } from "../types";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import z from "zod";

const STATUS_OPTIONS: SelectFieldOption[] = [
  {
    value: "pending",
    label: STATUS_LABELS.pending,
    icon: <Clock className="size-4 shrink-0 text-warning" />,
  },
  {
    value: "confirmed",
    label: STATUS_LABELS.confirmed,
    icon: <CheckCircle className="size-4 shrink-0 text-success" />,
  },
  {
    value: "cancelled",
    label: STATUS_LABELS.cancelled,
    icon: <XCircle className="size-4 shrink-0 text-destructive" />,
  },
];

/** A target invitation page the guest can attach to, with its own party-size
 *  limits + message-field visibility. A single page = no picker (implicit). */
export interface GuestPageOption {
  id: string;
  label: string;
  minGuest: number;
  maxGuest: number;
  showMessage: boolean;
}

interface UseGuestFormOpts {
  /** Available target pages (≥1). Bounds follow the page selected in-form. */
  pages: GuestPageOption[];
  /** Initially-selected page id. */
  pageId: string;
  defaultValues?: Partial<GuestFormValues>;
  onSubmit: (values: GuestFormValues, invitationId: string) => void;
}

// Schema errors plus a party-size range check against the *selected* page's
// configured min/max, so the client matches what the RPC will accept. Reading
// the page from the form value keeps it reactive when the picker changes.
function validateGuestForm(
  value: GuestFormValues & { invitation_id?: string },
  pages: GuestPageOption[],
) {
  const fields: Record<string, { message: string }> = {};

  const parsed = guestFormSchema.safeParse(value);
  if (!parsed.success) {
    const properties = z.treeifyError(parsed.error).properties ?? {};
    for (const [key, tree] of Object.entries(properties)) {
      if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
    }
  }

  const page = pages.find((p) => p.id === value.invitation_id) ?? pages[0];
  const minGuest = page?.minGuest ?? 1;
  const maxGuest = page?.maxGuest ?? 1;

  const count = Number(value.guest_count);
  if (!fields.guest_count && Number.isFinite(count)) {
    if (count < minGuest) {
      fields.guest_count = {
        message: `At least ${minGuest} ${minGuest === 1 ? "guest" : "guests"}`,
      };
    } else if (count > maxGuest) {
      fields.guest_count = {
        message: `At most ${maxGuest} ${maxGuest === 1 ? "guest" : "guests"}`,
      };
    }
  }

  return Object.keys(fields).length ? { fields } : undefined;
}

export const useGuestForm = ({
  pages,
  pageId,
  defaultValues,
  onSubmit,
}: UseGuestFormOpts) => {
  const initialPage = pages.find((p) => p.id === pageId) ?? pages[0];
  return useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      guest_count: defaultValues?.guest_count ?? initialPage?.minGuest ?? 1,
      status: defaultValues?.status ?? "pending",
      message: defaultValues?.message ?? "",
      invitation_id: pageId,
    },
    validators: {
      onSubmit: ({ value }) => validateGuestForm(value, pages),
      onChange: ({ value }) => validateGuestForm(value, pages),
    },
    onSubmit: ({ value }) => {
      onSubmit(guestFormSchema.parse(value), value.invitation_id);
    },
  });
};

interface GuestFormProps {
  /** Target pages; >1 renders the page picker, otherwise it stays implicit. */
  pages: GuestPageOption[];
}

const GuestForm: FC<GuestFormProps> = ({ pages }) => {
  const { form } = useFormShell();
  // Track the selected page live so the party-size limits + message field
  // re-resolve the moment the picker changes — no remount.
  const invitationId = useStore(
    form.store,
    (s: unknown) =>
      (s as { values: { invitation_id?: string } }).values.invitation_id,
  );
  const page = pages.find((p) => p.id === invitationId) ?? pages[0];
  const minGuest = page?.minGuest ?? 1;
  const maxGuest = page?.maxGuest ?? 1;
  const showMessage = page?.showMessage ?? false;

  const countHint =
    minGuest === maxGuest
      ? `${maxGuest} ${maxGuest === 1 ? "guest" : "guests"}`
      : `${minGuest}–${maxGuest} guests`;

  const pageOptions: SelectFieldOption[] = pages.map((p) => ({
    value: p.id,
    label: p.label,
  }));

  return (
    <FormBody>
      <FieldGroup>
        {pages.length > 1 && (
          <SelectField
            name="invitation_id"
            label="Invitation page"
            options={pageOptions}
          />
        )}
        <TextField name="name" label="Name" placeholder="e.g. Ali Hassan" />
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          optional
          placeholder="e.g. +60123456789"
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            name="guest_count"
            label="Party size"
            type="number"
            min={minGuest}
            max={maxGuest}
            step={1}
            hint={`Allowed: ${countHint}`}
          />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </div>
        {showMessage && (
          <TextareaField
            name="message"
            label="Message"
            optional
            rows={3}
            placeholder="Notes you want to keep against this guest…"
          />
        )}
      </FieldGroup>
    </FormBody>
  );
};

export default GuestForm;
