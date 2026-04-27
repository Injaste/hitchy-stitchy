import { useState, type FC } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { useRolesQuery } from "../../roles/queries";
import {
  inviteMemberSchema,
  editMemberSchema,
  type InviteMemberValues,
  type EditMemberValues,
} from "../types";

interface MemberFormPropsInvite {
  mode: "invite";
  defaultValues?: Partial<InviteMemberValues>;
  onSubmit: (values: InviteMemberValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

interface MemberFormPropsEdit {
  mode: "edit";
  defaultValues?: Partial<EditMemberValues>;
  onSubmit: (values: EditMemberValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

type MemberFormProps = MemberFormPropsInvite | MemberFormPropsEdit;

const MemberForm: FC<MemberFormProps> = ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const [attemptCount, setAttemptCount] = useState(0);
  const { data: roles } = useRolesQuery();

  const schema = mode === "invite" ? inviteMemberSchema : editMemberSchema;

  const assignableRoles = (roles ?? []).filter((r) => r.category !== "root");

  const form = useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      ...(mode === "invite" && {
        email: (defaultValues as Partial<InviteMemberValues>)?.email ?? "",
      }),
      role_id: defaultValues?.role_id ?? "",
    },
    validators: {
      onSubmit: schema,
      onChange: schema,
    },
    onSubmit: ({ value }) => {
      onSubmit(schema.parse(value) as any);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
    form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogBody className="space-y-6">
        <FieldGroup className="block space-y-4">
          <form.Field name="display_name">
            {(field) => {
              const hasError =
                Boolean(field.state.meta.errors.length) && attemptCount > 0;
              return (
                <AnimateItem
                  errors={field.state.meta.errors}
                  hasError={hasError}
                  attemptCount={attemptCount}
                >
                  <Field data-invalid={hasError} className="gap-2">
                    <FieldLabel>Display name</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. Sarah Tan"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FieldContent>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>

          {mode === "invite" && (
            <form.Field name="email">
              {(field) => {
                const hasError =
                  Boolean(field.state.meta.errors.length) && attemptCount > 0;
                return (
                  <AnimateItem
                    errors={field.state.meta.errors}
                    hasError={hasError}
                    attemptCount={attemptCount}
                  >
                    <Field data-invalid={hasError} className="gap-2">
                      <FieldLabel>Email</FieldLabel>
                      <FieldContent>
                        <Input
                          type="email"
                          placeholder="sarah@example.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </FieldContent>
                      <FieldDescription className="text-xs text-muted-foreground">
                        Email cannot be changed once assigned.
                      </FieldDescription>
                    </Field>
                  </AnimateItem>
                );
              }}
            </form.Field>
          )}

          <form.Field name="role_id">
            {(field) => {
              const hasError =
                Boolean(field.state.meta.errors.length) && attemptCount > 0;
              return (
                <AnimateItem
                  errors={field.state.meta.errors}
                  hasError={hasError}
                  attemptCount={attemptCount}
                >
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.length === 0 ? (
                          <SelectItem value="0" disabled>
                            No roles available — add roles first
                          </SelectItem>
                        ) : (
                          assignableRoles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </AnimateItem>
              );
            }}
          </form.Field>
        </FieldGroup>
      </DialogBody>

      <Separator />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default MemberForm;
