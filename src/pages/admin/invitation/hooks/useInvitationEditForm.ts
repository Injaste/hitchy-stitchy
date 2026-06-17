import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { themeRegistry } from "@/pages/wedding/templates";
import type { ThemeConfig } from "@/pages/wedding/templates/types";

import { useThemeSheetStore } from "../themes/editor/store";
import { useSheetLeaveGuard } from "../themes/editor/hooks/useThemeSheetLeaveGuard";
import { schema, rsvpDefaults } from "../config/components/ConfigsForm";
import { useInvitationMutations, useTemplatesQuery } from "../queries";
import {
  combineDeadline,
  deepEqual,
  designKeysOf,
  buildDesignDefaults,
  coerceDesign,
} from "../utils";
import type { Invitation, SaveInvitationPayload } from "../types";

// The controller object EditPanel passes to the footer/menu/modals.
export type InvitationEditController = ReturnType<typeof useInvitationEditForm>;

// Edit controller for one invitation: a single form (name + design + RSVP), with
// design values mirrored to the preview store; whole-invitation save (decision A);
// leave guard. Keeps EditPanel presentational.
export function useInvitationEditForm(
  invitation: Invitation,
  onClose: () => void,
) {
  const { eventId } = useAdminStore();
  const { save, publish, unpublish, remove } = useInvitationMutations();
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
  const validate = useCallback((): string | null => {
    setAttemptCount((c) => c + 1);
    const parsed = schema.safeParse(form.state.values);
    if (parsed.success) return null;
    form.handleSubmit();
    return (parsed.error.issues[0]?.path[0] as string) ?? "rsvp_mode";
  }, [form]);

  // Build the whole-invitation payload from the (already-valid) form values.
  const buildPayload = useCallback((): SaveInvitationPayload => {
    const values = form.state.values as Record<string, unknown>;
    const v = schema.parse(values);
    return {
      event_id: eventId!,
      id: invitation.id,
      template_key: invitation.template_key,
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
  }, [form, eventId, invitation.id, invitation.template_key, designKeys]);

  // Persist the draft (+ live settings). Reset the baseline so the sheet reads
  // clean afterwards.
  const commitSave = useCallback(async () => {
    await save.mutateAsync(buildPayload());
    form.reset(form.state.values);
  }, [save, buildPayload, form]);

  // Atomic publish: one RPC persists the draft AND promotes it.
  const commitPublish = useCallback(async () => {
    await publish.mutateAsync(buildPayload());
    form.reset(form.state.values);
  }, [publish, buildPayload, form]);

  // Leave-guard save = validate + commit (throws to keep the guard open on error).
  const saveFromGuard = useCallback(async () => {
    if (validate()) throw new Error("Please fix the highlighted fields");
    await commitSave();
  }, [validate, commitSave]);

  // Drop unsaved edits — revert the form + preview to the saved draft.
  const discardChanges = useCallback(() => {
    form.reset();
    initStore(invitation.id, invitation.draft_config);
    setPreviewPatch(null);
  }, [form, initStore, setPreviewPatch, invitation.id, invitation.draft_config]);

  const { attemptClose, modal, isSaving } = useSheetLeaveGuard({
    isDirty,
    onSave: saveFromGuard,
    onDiscard: discardChanges,
    onClose,
  });

  // Publish state. "Unpublished changes" = the saved draft design differs from
  // the published snapshot (RSVP settings are live, so they don't count).
  // Memoised so the deepEqual doesn't run on every render.
  const { isPublished, hasUnpublishedChanges, canPublish } = useMemo(() => {
    const published = !!invitation.published_at;
    const unpublishedChanges =
      published &&
      !deepEqual(invitation.draft_config, invitation.published_config);
    return {
      isPublished: published,
      hasUnpublishedChanges: unpublishedChanges,
      // Enable publish whenever the working design differs from what's live (or
      // it was never published) — independent of the Save button's dirty state.
      canPublish: isDirty || !published || unpublishedChanges,
    };
  }, [
    invitation.published_at,
    invitation.draft_config,
    invitation.published_config,
    isDirty,
  ]);

  // Fire-and-forget mutations; the confirm dialog drives the SubmitButton state
  // and closes itself on success (useCloseOnSuccess in EditPanel).
  const handleUnpublish = useCallback(
    () => unpublish.mutate({ event_id: eventId!, id: invitation.id }),
    [unpublish, eventId, invitation.id],
  );

  const handleDelete = useCallback(
    () => remove.mutate({ event_id: eventId!, id: invitation.id }),
    [remove, eventId, invitation.id],
  );

  // Reset the design draft to the template's base config — the DB seed that
  // create_invitation copies from (not the minimal registry scaffold). RSVP
  // settings are untouched; the user still Saves to persist.
  const resetToTemplate = useCallback(() => {
    const base =
      (templates?.find((t) => t.template_key === invitation.template_key)
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
  }, [templates, invitation.template_key, entry, groups, designKeys, form]);

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
