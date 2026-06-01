import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { container, itemFadeUp, itemScaleIn } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

import { useSignupMutation } from "./queries";
import { signUpSchema, type SignUpFormValues } from "./types";

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseSignUpFormOpts {
  onSubmit: (value: SignUpFormValues) => Promise<void>;
}

const useSignUpForm = ({ onSubmit }: UseSignUpFormOpts) =>
  useForm({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      agree_terms: false,
    },
    validators: {
      onSubmit: signUpSchema,
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const {
    mutateAsync: signup,
    isPending,
    error: mutationError,
  } = useSignupMutation();

  const form = useSignUpForm({
    onSubmit: async (value) => {
      await signup({
        fullName: value.full_name,
        email: value.email,
        password: value.password,
      });
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
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Account created!
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              We've sent a confirmation link to{" "}
              <span className="text-foreground font-medium">
                {form.getFieldValue("email")}
              </span>
              . Check your inbox to activate your account.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
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
                <UserPlus className="size-4" />
                <p className="text-sm font-medium">Create your account</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormShell form={form}>
                <FieldGroup>
                  <TextField
                    name="full_name"
                    label="Full name"
                    placeholder="Full name"
                    autoFocus
                    autoComplete="name"
                  />

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
                          autoComplete="new-password"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShowPassword((p) => !p)}
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

                  <FieldShell name="confirm_password" label="Confirm password">
                    {(field) => (
                      <InputGroup>
                        <InputGroupInput
                          type={showConfirm ? "text" : "password"}
                          placeholder="Confirm password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoComplete="new-password"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShowConfirm((p) => !p)}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  </FieldShell>

                  <FieldShell name="agree_terms">
                    {(field) => (
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="agree_terms"
                          checked={!!field.state.value}
                          onCheckedChange={(v) =>
                            field.handleChange(v === true)
                          }
                          onBlur={field.handleBlur}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="agree_terms"
                          className="text-xs font-normal leading-snug text-muted-foreground select-none"
                        >
                          I agree to the{" "}
                          <Link
                            to="/privacy"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </label>
                      </div>
                    )}
                  </FieldShell>

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

                <form.Subscribe selector={(s) => s.values.agree_terms}>
                  {(agreed) => (
                    <SubmitButton
                      isPending={isPending}
                      isError={Boolean(mutationError)}
                      disabled={!agreed}
                      className="w-full"
                    >
                      Create Account
                    </SubmitButton>
                  )}
                </form.Subscribe>
              </FormShell>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
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

export default Signup;
