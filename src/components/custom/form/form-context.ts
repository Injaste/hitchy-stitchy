import { createContext, useContext } from "react";

export interface FormShellContextValue {
  attemptCount: number;
  form: { Field: React.ComponentType<any> } & Record<string, any>;
  /**
   * Mutation pending state, optional. Provided by FormDialog from the modal's
   * mutation; consumed by SubmitButton to auto-disable + show pending label.
   * FormShell (non-dialog forms) leaves this undefined.
   */

  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

export const FormShellContext = createContext<FormShellContextValue | null>(null);

export const useFormShell = (): FormShellContextValue => {
  const ctx = useContext(FormShellContext);
  if (!ctx) {
    throw new Error("Field components must be rendered inside <FormShell>");
  }
  return ctx;
};
