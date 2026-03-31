import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "./queries";
import { scaleIn } from "@/lib/animations";
import { Link } from "react-router-dom";

const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

const errorVariants = {
  initial: { opacity: 0, y: -4, height: 0 },
  animate: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, height: 0, transition: { duration: 0.15 } },
};

const AuthForm = () => {
  const { mutate: login, isPending } = useLoginMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      const { email, password } = value;
      login({ email, password });
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center flex-col mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">
            Hitchy Stitchy
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            A Wedding Planning Suite
          </p>
        </div>

        <Card>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                {/* Email */}
                <form.Field name="email">
                  {(field) => {
                    const error = field.state.meta.errors;
                    const hasError = error.length && field.state.meta.isTouched;
                    return (
                      <motion.div
                        variants={shakeVariants}
                        animate={hasError ? "shake" : "idle"}
                      >
                        <Field data-invalid={hasError} className="gap-2">
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <FieldContent>
                            <Input
                              id="email"
                              type="email"
                              autoComplete="email"
                              placeholder="Email"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                if (submitError) setSubmitError(null);
                              }}
                            />
                            <AnimatePresence>
                              {hasError && (
                                <motion.div
                                  variants={errorVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  className="overflow-hidden"
                                >
                                  <FieldError errors={error} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FieldContent>
                        </Field>
                      </motion.div>
                    );
                  }}
                </form.Field>

                {/* Password */}
                <form.Field name="password">
                  {(field) => {
                    const error = field.state.meta.errors;
                    const hasError =
                      Boolean(error.length) && field.state.meta.isTouched;
                    return (
                      <motion.div
                        variants={shakeVariants}
                        animate={hasError ? "shake" : "idle"}
                      >
                        <Field data-invalid={hasError} className="gap-2">
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <FieldContent>
                            <Input
                              id="password"
                              type="password"
                              autoComplete="current-password"
                              placeholder="Password"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                if (submitError) setSubmitError(null);
                              }}
                            />
                            <AnimatePresence>
                              {hasError && (
                                <motion.div
                                  variants={errorVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  className="overflow-hidden"
                                >
                                  <FieldError errors={error} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FieldContent>
                        </Field>
                      </motion.div>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              {/* Server error */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    variants={errorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <FieldError>{submitError}</FieldError>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <form.Subscribe
                selector={(state) => [
                  state.isSubmitting,
                  state.isSubmitSuccessful,
                ]}
              >
                {([isSubmitting, isSubmitSuccessful]) => {
                  const isDisabled =
                    (isSubmitting || isSubmitSuccessful) && !submitError;
                  return (
                    <motion.div whileTap={!isDisabled ? { scale: 0.98 } : {}}>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isDisabled}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {isDisabled ? (
                            <motion.span
                              key="loading"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Loader2 className="animate-spin" />
                              Signing in...
                            </motion.span>
                          ) : (
                            <motion.span
                              key="idle"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              Sign in
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  );
                }}
              </form.Subscribe>
            </form>
          </CardContent>
        </Card>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="text-center mt-6 space-y-2"
        >
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthForm;
