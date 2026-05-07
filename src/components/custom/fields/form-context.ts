import { createContext, useContext } from "react";

export interface FormShellContextValue {
  attemptCount: number;
  form: { Field: React.ComponentType<any> } & Record<string, any>;
}

export const FormShellContext = createContext<FormShellContextValue | null>(null);

export const useFormShell = (): FormShellContextValue => {
  const ctx = useContext(FormShellContext);
  if (!ctx) {
    throw new Error("Field components must be rendered inside <FormShell>");
  }
  return ctx;
};
