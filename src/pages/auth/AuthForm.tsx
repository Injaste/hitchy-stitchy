import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "./queries";
import {
  container,
  errorVariants,
  itemFadeIn,
  itemFadeUp,
  itemScaleIn,
  shakeVariants,
} from "@/lib/animations";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const AuthForm = () => {
  const { mutate: login } = useLoginMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Track attempts to re-trigger animations on click
  const [attemptCount, setAttemptCount] = useState(0);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      login(value);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1); // Increments on every click
    form.handleSubmit();
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen flex justify-center items-center px-4"
    >
      <div className="w-full max-w-sm">
        {/* 1. Logo & Title */}
        <motion.div
          variants={itemScaleIn}
          className="flex items-center flex-col mb-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">
            Hitchy Stitchy
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            A Wedding Planning Suite
          </p>
        </motion.div>

        {/* 2. The Card (Animates as one unit) */}
        <motion.div variants={itemFadeUp}>
          <Card>
            <CardHeader>
              <CardTitle>Lets get into planning!</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <FieldGroup>
                  <form.Field name="email">
                    {(field) => {
                      const error = field.state.meta.errors;
                      const hasError =
                        error.length && field.state.meta.isTouched;
                      return (
                        // Key includes attemptCount to re-trigger shake on submit click
                        <motion.div
                          key={`email-error-${attemptCount}`}
                          variants={shakeVariants}
                          animate={hasError ? "shake" : "idle"}
                        >
                          <Field data-invalid={hasError} className="gap-2">
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <FieldContent>
                              <Input
                                id="email"
                                placeholder="Email"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                              <AnimatePresence mode="wait">
                                {hasError && (
                                  <motion.div
                                    key="email-error-msg"
                                    {...errorVariants}
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

                  <form.Field name="password">
                    {(field) => {
                      const error = field.state.meta.errors;
                      const hasError =
                        Boolean(error.length) && field.state.meta.isTouched;
                      return (
                        <motion.div
                          key={`password-error-${attemptCount}`}
                          variants={shakeVariants}
                          animate={hasError ? "shake" : "idle"}
                        >
                          <Field data-invalid={hasError} className="gap-2">
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <FieldContent>
                              <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                              <AnimatePresence mode="wait">
                                {hasError && (
                                  <motion.div
                                    key="pass-error-msg"
                                    {...errorVariants}
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

                <form.Subscribe
                  selector={(s) => [s.isSubmitting, s.isSubmitSuccessful]}
                >
                  {([isSubmitting, isSubmitSuccessful]) => {
                    const isDisabled =
                      (isSubmitting || isSubmitSuccessful) && !submitError;
                    return (
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isDisabled}
                      >
                        {isDisabled ? "Signing in..." : "Sign in"}
                      </Button>
                    );
                  }}
                </form.Subscribe>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Footer */}
        <motion.div variants={itemFadeUp} className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthForm;
