import { useState, type SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, NotebookPen } from "lucide-react";
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
import { AnimateItem } from "@/components/animations/forms/field-animate";

const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const SignIn = () => {
  const { mutate: login, isPending } = useLoginMutation({
    onError: (error) => {
      setSubmitError(error.message);
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track attempts to re-trigger animations on click
  const [attemptCount, setAttemptCount] = useState(0);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  const handleFormSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    setSubmitError(null);
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
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

        <motion.div variants={itemFadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <NotebookPen className="size-4 " />
                <p className="text-sm font-medium">Lets get into planning!</p>
              </CardTitle>
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
                        <AnimateItem
                          key={`password-error-${attemptCount}`}
                          errors={field.state.meta.errors}
                          hasError={hasError}
                          attemptCount={attemptCount}
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
                            </FieldContent>
                          </Field>
                        </AnimateItem>
                      );
                    }}
                  </form.Field>
                </FieldGroup>

                <AnimateItem
                  hasError={Boolean(submitError)}
                  error={submitError}
                  attemptCount={attemptCount}
                />

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

export default SignIn;
