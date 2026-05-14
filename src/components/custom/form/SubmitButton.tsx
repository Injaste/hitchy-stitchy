import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useFormShell } from "./form-context";

interface SubmitButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "type" | "disabled"> {
  children: ReactNode;
  /** Label shown while the mutation is pending. Defaults to "Saving…". */
  pendingLabel?: ReactNode;
}

/**
 * Submit button that auto-disables and shows a pending label based on
 * `isPending` from FormShellContext (provided by FormDialog). Use inside
 * a <FormDialog> footer to remove per-modal `disabled={mutation.isPending}`
 * boilerplate.
 *
 *   <SubmitButton>Add role</SubmitButton>
 *   <SubmitButton pendingLabel="Sending…">Send invite</SubmitButton>
 */
const SubmitButton = ({
  children,
  pendingLabel = "Saving…",
  ...props
}: SubmitButtonProps) => {
  const { isPending = false } = useFormShell();

  return (
    <Button type="submit" disabled={isPending} {...props}>
      {isPending ? pendingLabel : children}
    </Button>
  );
};

export default SubmitButton;
