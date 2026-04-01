import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Users } from "lucide-react";

const FULL_NAME = "Sarah Johnson";
const GUEST_COUNT = 4;
const CYCLE_MS = 9000;

type Phase = "idle" | "typing" | "guests" | "submitting" | "success";

export function RsvpMock() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayedName, setDisplayedName] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guestRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = () => {
    if (typingRef.current) clearInterval(typingRef.current);
    if (guestRef.current) clearInterval(guestRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
  };

  const runCycle = () => {
    setPhase("idle");
    setDisplayedName("");
    setGuestCount(0);

    // Phase: typing (1s delay, then type)
    cycleRef.current = setTimeout(() => {
      setPhase("typing");
      let i = 0;
      typingRef.current = setInterval(() => {
        i++;
        setDisplayedName(FULL_NAME.slice(0, i));
        if (i >= FULL_NAME.length) {
          clearInterval(typingRef.current!);

          // Phase: guests
          cycleRef.current = setTimeout(() => {
            setPhase("guests");
            let g = 0;
            guestRef.current = setInterval(() => {
              g++;
              setGuestCount(g);
              if (g >= GUEST_COUNT) {
                clearInterval(guestRef.current!);

                // Phase: submitting
                cycleRef.current = setTimeout(() => {
                  setPhase("submitting");

                  // Phase: success
                  cycleRef.current = setTimeout(() => {
                    setPhase("success");

                    // Reset
                    cycleRef.current = setTimeout(runCycle, 2200);
                  }, 900);
                }, 700);
              }
            }, 280);
          }, 400);
        }
      }, 75);
    }, 800);
  };

  useEffect(() => {
    runCycle();
    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* Chrome */}
      <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground font-medium mx-auto">
          Guest RSVP · Dan &amp; Nad's Wedding
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
              <Check className="w-7 h-7 text-secondary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">RSVP Confirmed!</p>
              <p className="text-sm text-muted-foreground mt-1">
                See you there, {FULL_NAME.split(" ")[0]} 🎉
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 space-y-5"
          >
            {/* Name field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your name
              </label>
              <div className="relative flex items-center rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground min-h-[38px]">
                <span>{displayedName}</span>
                {phase === "typing" && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Guest count */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                Number of guests
              </label>
              <div className="flex items-center gap-2">
                {[...Array(GUEST_COUNT + 1)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      backgroundColor: i < guestCount ? "oklch(0.76 0.13 85)" : "oklch(0.92 0.02 85)",
                      scale: i === guestCount - 1 && phase === "guests" ? [1, 1.3, 1] : 1,
                    }}
                    transition={{ duration: 0.25 }}
                    className="w-6 h-6 rounded-full"
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  {guestCount > 0 ? `${guestCount} guest${guestCount > 1 ? "s" : ""}` : ""}
                </span>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              animate={{
                backgroundColor: phase === "submitting"
                  ? "oklch(0.76 0.13 85 / 0.7)"
                  : "oklch(0.76 0.13 85)",
              }}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
            >
              {phase === "submitting" ? (
                <>
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  />
                  Confirming…
                </>
              ) : (
                "Confirm Attendance"
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
