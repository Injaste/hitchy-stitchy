import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { KeyRound, MailCheck } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/custom/logo";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  FormError,
  TextField,
} from "@/components/custom/form";
import { Button } from "@/components/ui/button";
import { container, itemFadeUp, itemScaleIn } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

import { useResetPasswordMutation } from "./queries";
import { resetPasswordSchema, type ResetPasswordFormValues } from "./types";
import ComponentFade from "@/components/animations/animate-component-fade";

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseResetPasswordFormOpts {
  onSubmit: (value: ResetPasswordFormValues) => Promise<void>;
}

const useResetPasswordForm = ({ onSubmit }: UseResetPasswordFormOpts) =>
  useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: resetPasswordSchema,
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const ResetPassword = () => {
  const [succeeded, setSucceeded] = useState(false);

  const {
    mutateAsync: resetPassword,
    isPending,
    error: mutationError,
    reset: resetMutation,
  } = useResetPasswordMutation();

  const form = useResetPasswordForm({
    onSubmit: async (value) => {
      resetMutation();
      await resetPassword(value);
      setSucceeded(true);
    },
  });

  const renderBody = () => {
    if (succeeded)
      return (
        <ComponentFade
          key="success"
          className="flex min-h-screen items-center justify-center px-4"
        >
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <MailCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                We've sent a password reset link to{" "}
                <span className="text-foreground font-medium">
                  {form.getFieldValue("email")}
                </span>
                . Follow the link to set a new password.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/login">
                  <Button className="w-full">Ready to login?</Button>
                </Link>
                <BackLink to="/" label="Back to Home" />
              </div>
            </motion.div>
          </div>
        </ComponentFade>
      );

    return (
      <ComponentFade key="reset">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex min-h-screen justify-center items-center px-4"
        >
          <div className="w-full max-w-sm">
            <motion.div
              variants={itemScaleIn}
              className="flex items-center flex-col mb-6"
            >
              <Logo className="mb-4" imageClassName="w-24 h-24 -mb-6" />
              <h1 className="text-2xl font-bold text-primary">
                Hitchy Stitchy
              </h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                A Wedding Planning Suite
              </p>
            </motion.div>

            <motion.div variants={itemFadeUp}>
              <FormCard
                form={form}
                isPending={isPending}
                isError={Boolean(mutationError)}
              >
                <FormHeader
                  icon={<KeyRound className="size-4" />}
                  title="Reset your password"
                />

                <FormBody>
                  <FieldGroup>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Email"
                      autoFocus
                      autoComplete="email"
                      description="Enter the email linked to your account and we'll send you a reset link."
                    />

                    <FormError error={mutationError} />
                  </FieldGroup>
                </FormBody>

                <FormFooter submitLabel="Send reset link" fullWidth />
              </FormCard>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              className="text-center mt-6 space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Login here!
                </Link>
              </p>
              <BackLink to="/" label="Back to Home" />
            </motion.div>
          </div>
        </motion.div>
      </ComponentFade>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
    </div>
  );
};

export default ResetPassword;
