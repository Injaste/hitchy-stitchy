import { Link } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { NotebookPen } from "lucide-react";
import Logo from "@/components/custom/logo";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  FormShell,
  TextField,
  PasswordField,
  SubmitButton,
} from "@/components/custom/form";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { container, itemFadeUp, itemScaleIn } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

import { useLoginMutation } from "./queries";
import { signInSchema, type SignInFormValues } from "./types";

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseSignInFormOpts {
  onSubmit: (value: SignInFormValues) => Promise<void>;
}

const useSignInForm = ({ onSubmit }: UseSignInFormOpts) =>
  useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: signInSchema,
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const SignIn = () => {
  const {
    mutateAsync: login,
    isPending,
    error: errorLogin,
    reset: resetLogin,
  } = useLoginMutation();

  const form = useSignInForm({
    onSubmit: async (value) => {
      resetLogin();
      await login(value);
    },
  });

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
          <Logo className="mb-4" imageClassName="w-24 h-24 -mb-6" />
          <h1 className="text-2xl font-bold text-primary">Hitchy Stitchy</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            A Wedding Planning Suite
          </p>
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <NotebookPen className="size-4" />
                <p className="text-sm font-medium">Lets get into planning!</p>
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
                    autoComplete="email"
                  />

                  <PasswordField
                    name="password"
                    label="Password"
                    placeholder="Password"
                  />

                  <div className="-mt-1 text-right">
                    <Link
                      to="/reset-password"
                      className="text-xs text-muted-foreground hover:text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <form.Subscribe selector={(s) => s.submissionAttempts}>
                    {(attempts) => (
                      <AnimateItem
                        hasError={Boolean(errorLogin)}
                        error={errorLogin}
                        attemptCount={attempts}
                      />
                    )}
                  </form.Subscribe>
                </FieldGroup>

                <SubmitButton
                  isPending={isPending}
                  isError={Boolean(errorLogin)}
                  className="w-full"
                >
                  Sign in
                </SubmitButton>
              </FormShell>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFadeUp} className="text-center mt-6">
          <BackLink to="/" label="Back to Home" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SignIn;
