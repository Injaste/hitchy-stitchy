import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, NotebookPen } from "lucide-react";
import Logo from "@/components/custom/logo";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  FormShell,
  TextField,
  FieldShell,
  SubmitButton,
} from "@/components/custom/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  const [showPassword, setShowPassword] = useState(false);

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
                <NotebookPen className="size-4" />
                <p className="text-sm font-medium">Lets get into planning!</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormShell form={form} className="space-y-4">
                <FieldGroup>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                  />

                  <FieldShell name="password" label="Password">
                    {(field) => (
                      <InputGroup>
                        <InputGroupInput
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShowPassword((p) => !p)}
                            onMouseLeave={() => setShowPassword(false)}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  </FieldShell>

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
