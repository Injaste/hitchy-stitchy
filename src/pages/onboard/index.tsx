import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import OnboardPage from "./OnboardPage";
import { ComponentFade } from "@/components/animations/animate-component-fade";

export default function Onboard() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Already logged in — they shouldn't be here
        // We don't know their slug so just redirect to root
        navigate("/", { replace: true });
      }
    });
  }, []);

  return (
    <ComponentFade>
      <OnboardPage />
    </ComponentFade>
  );
}
