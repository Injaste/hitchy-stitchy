import { FieldError } from "@/components/ui/field";
import { errorVariants, shakeVariants } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";

const AnimateItem = ({
  errors,
  hasError,
  error,
  attemptCount,
  children,
}: {
  error?: string | null;
  errors?: Array<{ message?: string } | undefined>;
  hasError: boolean;
  attemptCount: number;
  children?: React.ReactNode;
}) => {
  return (
    <AnimateShake hasError={hasError} attemptCount={attemptCount}>
      {children}
      {error ? (
        <AnimateError hasError={hasError} error={error} />
      ) : (
        <AnimateError hasError={hasError} errors={errors} />
      )}
    </AnimateShake>
  );
};

const AnimateShake = ({
  hasError,
  attemptCount,
  children,
}: {
  hasError: boolean;
  attemptCount: number;
  children: React.ReactNode;
}) => (
  <motion.div
    key={`shake-${attemptCount}`}
    variants={shakeVariants}
    animate={hasError ? "shake" : "idle"}
  >
    {children}
  </motion.div>
);

const AnimateError = ({
  hasError,
  error,
  errors,
}: {
  hasError: boolean;
  error?: string | null;
  errors?: Array<{ message?: string } | undefined>;
}) => {
  return (
    <AnimatePresence mode="wait">
      {hasError && (
        <motion.div {...errorVariants} className="overflow-hidden">
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldError errors={errors} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { AnimateItem, AnimateShake, AnimateError };
