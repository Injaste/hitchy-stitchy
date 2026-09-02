import type { FC } from "react";
import { useForm, useStore } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  FieldShell,
  FormBody,
  useFormShell,
  type SelectFieldOption,
} from "@/components/custom/form";

import { guestFormSchema, STATUS_LABELS, type GuestFormValues } from "../types";
import { pageBounds, type GuestPageOption } from "../pageOptions";
import PageChecklist from "../components/PageChecklist";
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

const selectedPages = (
  value: { invitation_id?: string; invitation_ids?: string[] },
  pages: GuestPageOption[],
  multiPage: boolean,
): GuestPageOption[] => {
  const ids = multiPage
    ? (value.invitation_ids ?? [])
    : [value.invitation_id].filter(Boolean) as string[];
  return pages.filter((p) => ids.includes(p.id));
};

interface UseGuestFormOpts {
  /** Available target pages (≥1). */
  pages: GuestPageOption[];
  /** Initially-selected page id. */
  pageId: string;
  /** Create allows several pages (checkbox list); edit is a single move. */
  multiPage?: boolean;
  defaultValues?: Partial<GuestFormValues>;
  /** Receives the chosen page ids (one for edit, one-or-more for create). */
  onSubmit: (values: GuestFormValues, pageIds: string[]) => void;
}

// Schema errors plus a party-size check against the selected page(s)' bounds, so
// the client matches what the RPC accepts. Reads the live selection so it stays
// reactive as the picker changes.
function validateGuestForm(
  value: GuestFormValues & { invitation_id?: string; invitation_ids?: string[] },
  pages: GuestPageOption[],
  multiPage: boolean,
) {
  const fields: Record<string, { message: string }> = {};

  const parsed = guestFormSchema.safeParse(value);
  if (!parsed.success) {
    const properties = z.treeifyError(parsed.error).properties ?? {};
    for (const [key, tree] of Object.entries(properties)) {
      if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
    }
  }

  const selected = selectedPages(value, pages, multiPage);
  if (multiPage && selected.length === 0) {
    fields.invitation_ids = { message: "Select at least one page" };
  }

  const { minGuest, maxGuest, incompatible } = pageBounds(selected);
  if (multiPage && selected.length > 0 && incompatible) {
    fields.invitation_ids = {
      message: "These pages have incompatible party-size limits",
    };
  }

  const count = Number(value.guest_count);
  if (!fields.guest_count && !incompatible && selected.length && Number.isFinite(count)) {
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

  // A guest on a private page is matched by phone when claiming, so phone is
  // mandatory there.
  if (selected.some((p) => p.mode === "private") && !value.phone?.trim()) {
    fields.phone = { message: "Phone is required for reserved guests" };
  }

  return Object.keys(fields).length ? { fields } : undefined;
}

export const useGuestForm = ({
  pages,
  pageId,
  multiPage = false,
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
      invitation_id: pageId, // edit (single move)
      invitation_ids: [pageId] as string[], // create (one-or-more)
    },
    validators: {
      onSubmit: ({ value }) => validateGuestForm(value, pages, multiPage),
      onChange: ({ value }) => validateGuestForm(value, pages, multiPage),
    },
    onSubmit: ({ value }) => {
      const pageIds = multiPage
        ? (value.invitation_ids ?? [])
        : ([value.invitation_id].filter(Boolean) as string[]);
      onSubmit(guestFormSchema.parse(value), pageIds);
    },
  });
};

// Multi-page picker: a guest can be added to several pages at once. The page's
// mode fixes each row's type on the server, so any combination is valid here.
// Uses FieldShell (like AssigneeField) so "Add to pages" is a real field label —
// it goes destructive + shakes and surfaces the "select at least one" error like
// every other field. The list itself is the shared PageChecklist.
const PageChecklistField: FC<{ pages: GuestPageOption[] }> = ({ pages }) => (
  <FieldShell name="invitation_ids" label="Add to pages">
    {(field) => {
      const ids: string[] = field.state.value ?? [];
      return (
        <PageChecklist
          pages={pages}
          selectedIds={ids}
          onToggle={(id) =>
            field.handleChange(
              ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
            )
          }
        />
      );
    }}
  </FieldShell>
);

interface GuestFormProps {
  /** Target pages; >1 renders the picker, otherwise it stays implicit. */
  pages: GuestPageOption[];
  /** Create = checkbox list (one-or-more pages); edit = single move-select. */
  multiPage?: boolean;
}

const GuestForm: FC<GuestFormProps> = ({ pages, multiPage = false }) => {
  const { form } = useFormShell();
  const singleId = useStore(
    form.store,
    (s: unknown) => (s as { values: { invitation_id?: string } }).values.invitation_id,
  );
  const ids: string[] = useStore(
    form.store,
    (s: unknown) =>
      (s as { values: { invitation_ids?: string[] } }).values.invitation_ids ?? [],
  );

  const selected = multiPage
    ? pages.filter((p) => ids.includes(p.id))
    : pages.filter((p) => p.id === singleId);
  const { minGuest, maxGuest, showMessage } = pageBounds(
    selected.length ? selected : pages.slice(0, 1),
  );
  // Phone is the reserved guest's claim identity, so a private page makes it
  // required (validateGuestForm enforces it) — keep the label in step.
  const phoneRequired = selected.some((p) => p.mode === "private");

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
        {multiPage
          ? pages.length > 1 && <PageChecklistField pages={pages} />
          : pages.length > 1 && (
              <SelectField
                name="invitation_id"
                label="Invitation page"
                options={pageOptions}
              />
            )}
        <div className="grid grid-cols-2 gap-3">
          <TextField name="name" label="Name" placeholder="e.g. Ali Hassan" />
          <TextField
            name="phone"
            label="Phone"
            type="tel"
            optional={!phoneRequired}
            placeholder="e.g. +60123456789"
          />
        </div>
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
