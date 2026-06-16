import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { themeRegistry } from "@/pages/wedding/templates";
import type {
  ThemeConfig,
  ThemeFieldGroup,
} from "@/pages/wedding/templates/types";

import { useThemeSheetStore } from "../themes/editor/store";
import { useSheetLeaveGuard } from "../themes/editor/hooks/useThemeSheetLeaveGuard";
import { schema, rsvpDefaults } from "../config/components/ConfigsForm";
import { useEventInvitationMutations, useTemplatesQuery } from "../queries";
import { combineDeadline, deepEqual } from "../utils";
import type { EventInvitation, SaveInvitationPayload } from "../types";

// Flatten the template schema into the design field keys.
const designKeysOf = (groups: ThemeFieldGroup[]) =>
  groups.flatMap((g) => g.fields.map((f) => f.key));

// Seed the form's design half from the saved field_config, falling back to each
// field's schema default (section-list → empty array). Baking defaults in here
// means untouched fields still persist on save.
const buildDesignDefaults = (
  groups: ThemeFieldGroup[],
  config: ThemeConfig | null,
) => {
  const fc = (config ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const g of groups)
    for (const f of g.fields) {
      const raw = fc[f.key];
      out[f.key] =
        f.type === "section-list"
          ? Array.isArray(raw)
            ? raw
            : []
          : typeof raw === "string"
            ? raw
            : (f.default ?? "");
    }
  return out;
};

// Coerce design values for storage: strings trim→null, arrays as-is.
const coerceDesign = (values: Record<string, unknown>, keys: string[]) => {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = values[k];
    out[k] = Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v.trim() || null
        : (v ?? null);
  }
  return out;
};

// Edit controller for one invitation: a single form (name + design + RSVP), with
// design values mirrored to the preview store; whole-invitation save (decision A);
// leave guard. Keeps EditPanel presentational.
export function useInvitationEditForm(
  invitation: EventInvitation,
  onClose: () => void,
) {
  const { eventId } = useAdminStore();
  const { save, publish, unpublish, remove } = useEventInvitationMutations();
  const { data: templates } = useTemplatesQuery();

  const initStore = useThemeSheetStore((s) => s.init);
  const clearStore = useThemeSheetStore((s) => s.clear);
  const setDraft = useThemeSheetStore((s) => s.setDraft);
  const setPreviewPatch = useThemeSheetStore((s) => s.setPreviewPatch);

  const [attemptCount, setAttemptCount] = useState(0);

  const entry = themeRegistry[invitation.template_key];
  const groups = useMemo(() => entry?.schema ?? [], [entry]);
  const designKeys = useMemo(() => designKeysOf(groups), [groups]);

  const designDefaults = useMemo(
    () => buildDesignDefaults(groups, invitation.draft_config),
    [groups, invitation.draft_config],
  );

  const setDraftRef = useRef(setDraft);
  setDraftRef.current = setDraft;
  const designKeysRef = useRef(designKeys);
  designKeysRef.current = designKeys;

  const form = useForm({
    defaultValues: {
      name: invitation.name,
      ...designDefaults,
      ...rsvpDefaults(invitation),
    } as Record<string, unknown>,
    validators: {
      onChange: ({ value }) => {
        const parsed = schema.safeParse(value);
        if (parsed.success) return undefined;
        const properties = z.treeifyError(parsed.error).properties ?? {};
        const fields = Object.fromEntries(
          Object.entries(properties)
            .filter(([, tree]) => tree?.errors?.length)
            .map(([key, tree]) => [key, { message: tree!.errors[0] }]),
        );
        return { fields };
      },
    },
    listeners: {
      onChangeDebounceMs: 150,
      onChange: ({ formApi }) => {
        const v = formApi.state.values as Record<string, unknown>;
        const design: Record<string, unknown> = {};
        for (const k of designKeysRef.current) design[k] = v[k];
        setDraftRef.current(design as ThemeConfig);
      },
    },
  });

  const isDirty = useStore(form.store, (s) => s.isDirty);

  // Seed the preview store from the saved config; clear on unmount.
  useEffect(() => {
    initStore(invitation.id, invitation.draft_config);
    return () => clearStore();
  }, [invitation.id, invitation.draft_config, initStore, clearStore]);

  // Validate the whole form. On failure, surface the inline errors and return
  // the first invalid field key (so the caller can jump to its tab); null = OK.
  const validate = (): string | null => {
    setAttemptCount((c) => c + 1);
    const parsed = schema.safeParse(form.state.values);
    if (parsed.success) return null;
    form.handleSubmit();
    return (parsed.error.issues[0]?.path[0] as string) ?? "name";
  };

  // Build the whole-invitation payload from the (already-valid) form values.
  const buildPayload = (): SaveInvitationPayload => {
    const values = form.state.values as Record<string, unknown>;
    const v = schema.parse(values);
    return {
      event_id: eventId!,
      id: invitation.id,
      template_key: invitation.template_key,
      name: v.name,
      draft_config: coerceDesign(values, designKeys) as ThemeConfig,
      rsvp_mode: v.rsvp_mode,
      rsvp_deadline: combineDeadline(v.rsvp_deadline_date, v.rsvp_deadline_time),
      max_guests: v.max_guests,
      guest_count_min: v.guest_count_min,
      guest_count_max: v.guest_count_max,
      confirmation_message: v.confirmation_message,
      rsvp_config: {
        rsvp: {
          fields: {
            message: {
              visible: v.message_visible,
              required: v.message_visible ? v.message_required : false,
            },
          },
        },
      },
    };
  };

  // Persist the draft (+ live settings). Reset the baseline so the sheet reads
  // clean afterwards.
  const commitSave = async () => {
    await save.mutateAsync(buildPayload());
    form.reset(form.state.values);
  };

  // Atomic publish: one RPC persists the draft AND promotes it.
  const commitPublish = async () => {
    await publish.mutateAsync(buildPayload());
    form.reset(form.state.values);
  };

  // Leave-guard save = validate + commit (throws to keep the guard open on error).
  const saveFromGuard = async () => {
    if (validate()) throw new Error("Please fix the highlighted fields");
    await commitSave();
  };

  // Drop unsaved edits — revert the form + preview to the saved draft.
  const discardChanges = () => {
    form.reset();
    initStore(invitation.id, invitation.draft_config);
    setPreviewPatch(null);
  };

  const { attemptClose, modal, isSaving } = useSheetLeaveGuard({
    isDirty,
    onSave: saveFromGuard,
    onDiscard: discardChanges,
    onClose,
  });

  // Publish state. "Unpublished changes" = the saved draft design differs from
  // the published snapshot (RSVP settings are live, so they don't count).
  const isPublished = !!invitation.published_at;
  const hasUnpublishedChanges =
    isPublished &&
    !deepEqual(invitation.draft_config, invitation.published_config);
  // Enable publish whenever the working design differs from what's live (or it
  // has never been published) — independent of the Save button's dirty state.
  const canPublish = isDirty || !isPublished || hasUnpublishedChanges;

  // Fire-and-forget mutations; the confirm dialog drives the SubmitButton state
  // and closes itself on success (useCloseOnSuccess in EditPanel).
  const handleUnpublish = () =>
    unpublish.mutate({ event_id: eventId!, id: invitation.id });

  const handleDelete = () =>
    remove.mutate({ event_id: eventId!, id: invitation.id });

  // Reset the design draft to the template's base config — the DB seed that
  // create_invitation copies from (not the minimal registry scaffold). RSVP
  // settings are untouched; the user still Saves to persist.
  const resetToTemplate = () => {
    const base =
      (templates?.find((t) => t.slug === invitation.template_key)
        ?.field_config as ThemeConfig | undefined) ??
      entry?.defaultConfig ??
      null;
    const defaults = buildDesignDefaults(groups, base);
    // setFieldValue alone doesn't flip the form's dirty flag, so mark the meta
    // too — otherwise Save stays disabled after a reset.
    for (const k of designKeys) {
      form.setFieldValue(k, defaults[k]);
      form.setFieldMeta(k, (m) => ({ ...m, isDirty: true, isTouched: true }));
    }
  };

  return {
    entry,
    form,
    attemptCount,
    isDirty,
    isSaving,
    isPending: save.isPending,
    isSuccess: save.isSuccess,
    isError: save.isError,
    validate,
    commitSave,
    commitPublish,
    attemptClose,
    modal,
    // publish/lifecycle
    isPublished,
    hasUnpublishedChanges,
    canPublish,
    handleUnpublish,
    handleDelete,
    resetToTemplate,
    discardChanges,
    publishPending: publish.isPending,
    publishSuccess: publish.isSuccess,
    publishError: publish.isError,
    unpublishPending: unpublish.isPending,
    unpublishSuccess: unpublish.isSuccess,
    unpublishError: unpublish.isError,
    deletePending: remove.isPending,
    deleteSuccess: remove.isSuccess,
    deleteError: remove.isError,
  };
}
