import { forwardRef, useState, type FormHTMLAttributes, type ReactNode } from "react";
import { FormShellContext, type FormShellContextValue } from "./form-context";

interface FormShellProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  form: FormShellContextValue["form"];
  children: ReactNode;
}

const FormShell = forwardRef<HTMLFormElement, FormShellProps>(
  ({ form, children, ...formProps }, ref) => {
    const [attemptCount, setAttemptCount] = useState(0);

    const submit = () => {
      setAttemptCount((c) => c + 1);
      form.handleSubmit();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submit();
      }
    };

    return (
      <FormShellContext.Provider value={{ attemptCount, form }}>
        <form ref={ref} onSubmit={handleSubmit} onKeyDown={handleKeyDown} {...formProps}>
          {children}
        </form>
      </FormShellContext.Provider>
    );
  }
);

FormShell.displayName = "FormShell";

export default FormShell;
