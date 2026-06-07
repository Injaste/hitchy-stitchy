import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowBigDown, LoaderCircle } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import { FormShell, FieldShell, FormError } from "@/components/custom/form";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

import { FloralSVG } from "./Decorations";
import { useSubscribeMutation } from "@/pages/home/queries";
import {
  subscribeSchema,
  type SubscribeFormValues,
} from "@/pages/home/types";

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseSubscribeFormOpts {
  onSubmit: (value: SubscribeFormValues) => Promise<void>;
}

const useSubscribeForm = ({ onSubmit }: UseSubscribeFormOpts) =>
  useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: subscribeSchema, onChange: subscribeSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

export function CTABanner() {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    mutateAsync: subscribe,
    isPending,
    data: subscribed,
    error,
    reset,
  } = useSubscribeMutation();

  const form = useSubscribeForm({
    onSubmit: async (value) => {
      reset();
      await subscribe({ email: value.email });
    },
  });

  useEffect(() => {
    const focus = () => {
      if (window.location.hash === "#get-started") {
        setTimeout(() => {
          formRef.current
            ?.querySelector<HTMLInputElement>("input[type=email]")
            ?.focus();
        }, 150);
      }
    };
    focus();
    window.addEventListener("hashchange", focus);
    return () => window.removeEventListener("hashchange", focus);
  }, []);

  return (
    <section
      id="get-started"
      className="bg-gradient-surface py-28 px-6 md:px-12 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="inline-flex items-center justify-center text-primary/40 mb-8">
          <FloralSVG className="w-16 h-16" />
        </div>

        <h2 className="flex items-center justify-center gap-4 font-bold text-4xl md:text-6xl text-foreground mb-6 max-w-2xl mx-auto leading-tight">
          Create Your Event
          <ArrowBigDown className="size-16 text-primary animate-bounce" />
        </h2>

        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Join couples who chose clarity over chaos. Leave your email and we'll
          let you know when we're ready for you.
        </p>

        {subscribed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              You're on the list. We'll be in touch.
            </p>
          </motion.div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <FormShell ref={formRef} form={form}>
                <FieldGroup>
                  {/* Bespoke: InputGroup with an inline submit button — can't use
                      TextField since the button lives inside the input addon. */}
                  <FieldShell name="email">
                    {(field) => (
                      <InputGroup>
                        <InputGroupInput
                          type="email"
                          placeholder="your@email.com"
                          autoComplete="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <InputGroupAddon align="inline-end" className="p-0.75">
                          <InputGroupButton
                            type="submit"
                            variant="default"
                            size="sm"
                            disabled={isPending}
                            className="rounded-l-none"
                          >
                            {isPending ? (
                              <LoaderCircle className="animate-spin" />
                            ) : (
                              "Notify me"
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  </FieldShell>
                  <FormError error={error} />
                </FieldGroup>
              </FormShell>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
