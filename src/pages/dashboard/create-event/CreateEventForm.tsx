import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepsDirection } from "@/components/custom/steps-direction";

import { useCreateEventMutation } from "../queries";
import {
  STEPS,
  type CreateEventData,
  type CreateRoleData,
  type StepType,
} from "../types";

import CreateEventStepper from "./CreateEventStepper";
import StepEvent from "./steps/StepEvent";
import StepRole from "./steps/StepRole";

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<StepType>(STEPS[0]);
  const [eventData, setEventData] = useState<CreateEventData | null>(null);
  const [roleData, setRoleData] = useState<Partial<CreateRoleData> | null>(
    null,
  );

  const {
    mutate: createEvent,
    isPending: isCreating,
    error,
    isError,
    reset: resetCreateEvent,
  } = useCreateEventMutation({
    onSuccess: (data) => {
      navigate(`/${data.slug}/admin`, { replace: true });
    },
  });

  const handleSubmit = (data: CreateRoleData) => {
    if (!eventData) return;
    createEvent({ ...eventData, ...data });
  };

  return (
    <LayoutGroup id="create-event">
      <motion.div layout="size">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <CalendarPlus className="size-4" />
              <p className="text-sm font-medium">Plan your event</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <CreateEventStepper activeStep={activeStep} />

            <StepsDirection
              value={activeStep}
              order={STEPS}
              onChange={(v) => setActiveStep(v as StepType)}
            >
              {activeStep === "Event" && (
                <StepEvent
                  defaultValues={eventData ?? undefined}
                  onNext={(data) => setEventData(data)}
                />
              )}

              {activeStep === "Role" && (
                <StepRole
                  defaultValues={roleData ?? undefined}
                  onBack={(data) => {
                    if (data.role_name) setRoleData(data);
                    if (isError) resetCreateEvent();
                  }}
                  onSubmit={handleSubmit}
                  isSubmitting={isCreating}
                  error={error}
                />
              )}
            </StepsDirection>
          </CardContent>
        </Card>
      </motion.div>
    </LayoutGroup>
  );
};

export default CreateEventForm;
