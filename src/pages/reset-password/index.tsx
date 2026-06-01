import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { KeyRound, MailCheck } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/custom/logo";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { FormShell, TextField, SubmitButton } from "@/components/custom/form";
import { Button } from "@/components/ui/button";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { container, itemFadeUp, itemScaleIn } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

import { useResetPasswordMutation } from "./queries";
import { resetPasswordSchema, type ResetPasswordFormValues } from "./types";

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

  if (succeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
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
              <Link to="/dashboard">
                <Button className="w-full">Back to Sign in</Button>
              </Link>
              <BackLink to="/" label="Back to Home" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen flex justify-center items-center px-4"
    >
      <div className="w-full max-w-sm">
        <motion.div
          variants={itemScaleIn}
          className="flex items-center flex-col mb-6"
        >
          <Logo className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-primary">Hitchy Stitchy</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            A Wedding Planning Suite
          </p>
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <KeyRound className="size-4" />
                <p className="text-sm font-medium">Reset your password</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormShell form={form}>
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

                  <form.Subscribe selector={(s) => s.submissionAttempts}>
                    {(attempts) => (
                      <AnimateItem
                        hasError={Boolean(mutationError)}
                        error={mutationError}
                        attemptCount={attempts}
                      />
                    )}
                  </form.Subscribe>
                </FieldGroup>

                <SubmitButton
                  isPending={isPending}
                  isError={Boolean(mutationError)}
                  className="w-full"
                >
                  Send reset link
                </SubmitButton>
              </FormShell>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFadeUp} className="text-center mt-6 space-y-2">
          <p className="text-xs text-muted-foreground">
            Remember your password?{" "}
            <Link
              to="/dashboard"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
          <BackLink to="/" label="Back to Home" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
