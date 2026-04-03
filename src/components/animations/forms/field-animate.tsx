import { FieldError } from "@/components/ui/field";
import { motion, useAnimate, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

type FieldErrors = Array<{ message?: string } | undefined>;
type AllErrors = Error | string | null;

function resolveMessage(
  errors?: FieldErrors,
  error?: AllErrors,
): string | null {
  if (error) {
    return typeof error === "string" ? error : (error.message ?? String(error));
  }
  return errors?.find((e) => e?.message)?.message ?? null;
}

const AnimateItem = ({
  errors,
  hasError,
  error,
  attemptCount,
  children,
}: {
  error?: AllErrors;
  errors?: FieldErrors;
  hasError: boolean;
  attemptCount: number;
  children?: React.ReactNode;
}) => {
  const [scope, animate] = useAnimate();

  // Fire shake imperatively — no key change, no remount, no focus loss
  useEffect(() => {
    if (!hasError) return;
    animate(scope.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.35 });
  }, [attemptCount, hasError]);

  return (
    <div ref={scope}>
      {children}
      <AnimateError hasError={hasError} errors={errors} error={error} />
    </div>
  );
};

const AnimateError = ({
  hasError,
  error,
  errors,
}: {
  hasError: boolean;
  error?: AllErrors;
  errors?: FieldErrors;
}) => {
  const message = resolveMessage(errors, error);

  // Track previous message so we only re-animate on a genuinely new error
  const prevRef = useRef<string | null>(null);
  const keyRef = useRef(0);
  if (message !== prevRef.current) {
    prevRef.current = message;
    keyRef.current += 1;
  }

  return (
    <AnimatePresence initial={false}>
      {hasError && message && (
        <motion.div
          key={keyRef.current}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: "hidden" }}
          className="mt-0.5"
        >
          <FieldError>{message}</FieldError>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { AnimateItem, AnimateError };
