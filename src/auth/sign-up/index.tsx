import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Logo from "@/components/custom/logo";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  FormError,
  TextField,
  PasswordField,
  CheckboxField,
} from "@/components/custom/form";
import { Button } from "@/components/ui/button";
import { container, itemFadeUp, itemScaleIn } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

import { useSignupMutation } from "./queries";
import { signUpSchema, type SignUpFormValues } from "./types";
import { isSafeRedirect } from "../redirect";
import ComponentFade from "@/components/animations/animate-component-fade";

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
  const [succeeded, setSucceeded] = useState(false);
  const [searchParams] = useSearchParams();

  // Preserve the invite redirect so the token survives login ⇄ signup hops.
  const rawRedirect = searchParams.get("redirect");
  const loginHref = isSafeRedirect(rawRedirect)
    ? `/login?redirect=${encodeURIComponent(rawRedirect)}`
    : "/login";

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

  const renderBody = () => {
    if (succeeded)
      return (
        <ComponentFade
          key="success"
          useBlur
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
                . Please Check your inbox to activate your account.
              </p>
              <div className="flex flex-col gap-3">
                <Link to={loginHref}>
                  <Button className="w-full">Continue to login</Button>
                </Link>
                <BackLink to="/" label="Back to Home" />
              </div>
            </motion.div>
          </div>
        </ComponentFade>
      );

    return (
      <ComponentFade key="signup" useBlur>
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
                  icon={<UserPlus className="size-4" />}
                  title="Create your account"
                />

                <FormBody>
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

                    <PasswordField
                      name="password"
                      label="Password"
                      placeholder="Password"
                      autoComplete="new-password"
                    />

                    <PasswordField
                      name="confirm_password"
                      label="Confirm password"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                    />

                    <CheckboxField
                      name="agree_terms"
                      label={
                        <>
                          I agree to the{" "}
                          <Link
                            to="/privacy"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </>
                      }
                    />

                    <FormError error={mutationError} />
                  </FieldGroup>
                </FormBody>

                <form.Subscribe selector={(s) => s.values.agree_terms}>
                  {(agreed) => (
                    <FormFooter
                      submitLabel="Create Account"
                      fullWidth
                      submitDisabled={!agreed}
                    />
                  )}
                </form.Subscribe>
              </FormCard>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              className="text-center mt-6 space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to={loginHref}
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
      <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
    </div>
  );
};

export default Signup;
