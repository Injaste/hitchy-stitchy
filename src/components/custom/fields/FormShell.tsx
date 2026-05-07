import { useState, type FormHTMLAttributes, type ReactNode } from "react";
import { FormShellContext, type FormShellContextValue } from "./form-context";

interface FormShellProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  form: FormShellContextValue["form"];
  children: ReactNode;
}

const FormShell = ({ form, children, ...formProps }: FormShellProps) => {
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((c) => c + 1);
    form.handleSubmit();
  };

  return (
    <FormShellContext.Provider value={{ attemptCount, form }}>
      <form onSubmit={handleSubmit} {...formProps}>
        {children}
      </form>
    </FormShellContext.Provider>
  );
};

export default FormShell;
