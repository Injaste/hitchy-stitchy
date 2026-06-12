import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import { useForm, useStore } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import {
  FormShell,
  TextField,
  FieldShell,
  SubmitButton,
} from "@/components/custom/form";
import { useSteps } from "@/components/custom/steps-direction";
import { toSlug } from "@/hooks/useSlugCheck";
import { BASE_URL } from "@/lib/config";

import {
  stepDetailsSchema,
  type StepDetailsFormValues,
  type CreateDetailsData,
  type StepType,
} from "../../types";
import SlugInput, { type SlugInputHandle } from "../SlugInput";

interface StepDetailsProps {
  defaultValues?: Partial<CreateDetailsData>;
  onNext: (data: CreateDetailsData) => void;
  /** Called with the hold's expiry (ISO) + slug whenever it's reserved on change. */
  onReserved: (expiry: string, slug: string) => void;
}

const StepDetails: FC<StepDetailsProps> = ({
  defaultValues,
  onNext,
  onReserved,
}) => {
  const { goTo } = useSteps<StepType>();
  const [eventName, setEventName] = useState(defaultValues?.event_name ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugIsTaken, setSlugIsTaken] = useState(false);
  const slugRef = useRef<SlugInputHandle>(null);

  const form = useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      event_name: defaultValues?.event_name ?? "",
      slug: defaultValues?.slug ?? "",
    } as StepDetailsFormValues,
    validators: {
      onSubmit: stepDetailsSchema,
      onChange: stepDetailsSchema,
    },
    onSubmit: ({ value }) => {
      // The slug is already held (reserved as you type). Continue does NOT call
      // any slug RPC — it just blocks if the latest check came back taken and
      // advances. The only step with a real mutation is the last one (create).
      if (slugIsTaken) return;

      onNext({
        display_name: value.display_name.trim(),
        event_name: value.event_name.trim(),
        slug: value.slug,
      });
      goTo("Dates");
    },
  });

  const slugValue = useStore(form.store, (s) => s.values.slug);

  useEffect(() => {
    if (slugTouched) return;
    const generated = toSlug(defaultValues?.slug ?? eventName);
    form.setFieldValue("slug", generated);
    slugRef.current?.scheduleCheck(generated);
  }, [eventName, slugTouched]);

  return (
    <FormShell form={form} className="space-y-6">
      <FieldGroup>
        <TextField
          name="display_name"
          labelClassName="flex justify-between w-full"
          label={
            <>
              Your Name
              <span className="text-xs text-muted-foreground font-normal">
                — how you appear to your team
              </span>
            </>
          }
          placeholder="e.g. Danish"
        />

        <TextField
          name="event_name"
          label="Event Name"
          placeholder="e.g. Danish & Nadhirah Wedding"
          onValueChange={setEventName}
        />

        {/* Bespoke: SlugInput handles its own availability check and safe-char
            filtering — can't be expressed by a plain TextField. */}
        <FieldShell name="slug" label="Event URL">
          {(field, hasError) => (
            <SlugInput
              ref={slugRef}
              id="slug"
              value={field.state.value}
              invalid={hasError || slugIsTaken}
              onChange={(safe) => {
                setSlugTouched(true);
                field.handleChange(safe);
              }}
              onBlur={(currentValue) => {
                field.handleBlur();
                if (!currentValue) {
                  const generated = toSlug(eventName);
                  if (generated) {
                    form.setFieldValue("slug", generated);
                    slugRef.current?.scheduleCheck(generated);
                  }
                }
              }}
              onTakenChange={setSlugIsTaken}
              onReserved={onReserved}
            />
          )}
        </FieldShell>

        <div className="text-foreground p-4 rounded-md border border-secondary/30 bg-secondary/30">
          <h4 className="text-2xs uppercase tracking-widest font-semibold mb-3">
            Your Unique Wedding Links
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-sm italic min-w-[40px]">Admin:</span>
              <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 w-full truncate">
                {`${BASE_URL}/${slugValue || "my-wedding"}/admin`}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-sm italic min-w-[40px]">RSVP:</span>
              <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 w-full truncate">
                {`${BASE_URL}/${slugValue || "my-wedding"}`}
              </code>
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* Sync validate-and-advance — no async submit, so no pending state
          (SubmitButton's spinner only stops on success/error or unmount). */}
      <SubmitButton size="lg" isPending={false} className="w-full">
        Continue
      </SubmitButton>
    </FormShell>
  );
};

export default StepDetails;
