import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { AccountData } from "../steps/StepAccount";
import type { EventData } from "../steps/StepEvent";
import type { RoleData } from "../steps/StepRole";

export function useOnboarding() {
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

  return {
    step,
    setStep,
    account,
    event,
    isSubmitting,
    error,
    handleAccountNext,
    handleEventNext,
    handleRoleSubmit,
  };
}
