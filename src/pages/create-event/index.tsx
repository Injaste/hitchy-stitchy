import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import OnboardPage from "./OnboardPage";
import { ComponentFade } from "@/components/animations/animate-component-fade";

export default function Onboard() {
  const navigate = useNavigate();

  useEffect(() => {}, []);

  return (
    <ComponentFade>
      <OnboardPage />
    </ComponentFade>
  );
}
