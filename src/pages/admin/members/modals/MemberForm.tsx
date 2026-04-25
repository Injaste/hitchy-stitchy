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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { useRolesQuery } from "../../roles/queries";
import { inviteMemberSchema, type InviteMemberValues } from "../types";
import { useMembersQuery } from "../queries";
import { cn } from "@/lib/utils";

const SINGULAR_ROLES = ["Bride", "Groom"];

interface MemberFormProps {
  defaultValues?: Partial<InviteMemberValues>;
  onSubmit: (values: InviteMemberValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
  emailDisabled?: boolean;
}

const MemberForm: FC<MemberFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
  emailDisabled = false,
}) => {
  const [attemptCount, setAttemptCount] = useState(0);
  const { data: roles } = useRolesQuery();
  const { data: members } = useMembersQuery();

  // TODO CHECK CANNOT SUBMIT ROLE ROOT
  const takenSingularRoleIds = new Set(
    members!
      .filter((m) => SINGULAR_ROLES.includes(m.role?.name ?? ""))
      .map((m) => m.role_id),
  );

  const isFilled = takenSingularRoleIds.size === roles?.length;
  const assignableRoles = isFilled
    ? [
        {
          id: "0",
          name: "Please add roles",
        },
      ]
    : (roles ?? []);

  const form = useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      email: defaultValues?.email ?? "",
      role_id: defaultValues?.role_id ?? "",
    },
    validators: {
      onSubmit: inviteMemberSchema,
      onChange: inviteMemberSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(inviteMemberSchema.parse(value));
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
                        disabled={emailDisabled}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FieldContent>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>

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
                        {assignableRoles.map((r) => (
                          <SelectItem
                            key={r.id}
                            value={r.id}
                            disabled={takenSingularRoleIds.has(r.id)}
                            className={cn(
                              r.id === "0" && "pointer-events-auto",
                            )}
                          >
                            {r.name}
                            {takenSingularRoleIds.has(r.id) ? " (taken)" : ""}
                          </SelectItem>
                        ))}
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
