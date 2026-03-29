import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarHeart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { fadeUp, scaleIn, stepEnter, stepExit } from "./animations";
import { StepAccount, type AccountData } from "./steps/StepAccount";
import { StepEvent, type EventData } from "./steps/StepEvent";
import { StepRole, type RoleData } from "./steps/StepRole";

const STEP_LABELS = ["Account", "Event", "Role"];

export default function OnboardPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccountNext = (data: AccountData) => {
    setAccount(data);
    setStep(2);
  };

  const handleEventNext = (data: EventData) => {
    setEvent(data);
    setStep(3);
  };

  const handleRoleSubmit = async (roleData: RoleData) => {
    if (!account || !event) return;
    setIsSubmitting(true);
    setError(null);

    const { data, error: fnError } = await supabase.functions.invoke("onboard-event", {
      body: {
        email: account.email,
        password: account.password,
        fullName: account.fullName,
        eventName: event.eventName,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
        slug: event.slug,
        role: roleData.role,
        shortRole: roleData.shortRole,
      },
    });

    if (fnError || !data) {
      const message = fnError?.message ?? "Something went wrong. Please try again.";
      setError(message);
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (signInError) {
      toast.error("Account created but sign-in failed. Please try logging in manually.");
      setIsSubmitting(false);
      return;
    }

    navigate(`/${data.slug ?? event.slug}/admin`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={scaleIn(0.1)}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">Cozynosy</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Wedding Admin
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp(0.15)}
          className="bg-card rounded-2xl border border-border shadow-sm p-8"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as 1 | 2 | 3;
              const isActive = step === s;
              const isDone = step > s;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isDone
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? "✓" : s}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wide",
                        isActive ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-px mb-4 transition-colors",
                        isDone ? "bg-primary/40" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={{ ...stepEnter, ...stepExit }}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <StepAccount
                  defaultValues={account ?? undefined}
                  onNext={handleAccountNext}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step-2"
                variants={{ ...stepEnter, ...stepExit }}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <StepEvent
                  defaultValues={event ?? undefined}
                  onNext={handleEventNext}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step-3"
                variants={{ ...stepEnter, ...stepExit }}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <StepRole
                  onSubmit={handleRoleSubmit}
                  onBack={() => setStep(2)}
                  isSubmitting={isSubmitting}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{" "}
          <a href="/" className="hover:text-primary transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
