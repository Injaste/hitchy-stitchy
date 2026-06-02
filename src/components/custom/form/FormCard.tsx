import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { FormShellContext, type FormShellContextValue } from "./form-context";
import { useFormCore } from "./useFormCore";

interface FormCardProps {
  form: FormShellContextValue["form"];
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  resetOnSuccess?: boolean;
  children: ReactNode;
  className?: string;
}

/** Form inside an inline card. Same behaviour as FormDialog without the modal. */
const FormCard = ({
  form,
  isPending = false,
  isSuccess = false,
  isError = false,
  resetOnSuccess = false,
  children,
  className,
}: FormCardProps) => {
  const { formRef, contextValue, handleSubmit, handleKeyDown } = useFormCore({
    form,
    isPending,
    isSuccess,
    isError,
    resetOnSuccess,
    inDialog: false,
  });

  return (
    <FormShellContext.Provider value={contextValue}>
      <div
        className={cn(
          "relative grid gap-4 rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10",
          className,
        )}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="contents"
        >
          {children}
        </form>
      </div>
    </FormShellContext.Provider>
  );
};

export default FormCard;
