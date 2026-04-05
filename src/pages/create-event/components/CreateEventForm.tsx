import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useCreateEventMutation } from "../queries";
import CreateEventStepper from "./CreateEventStepper";
import StepEvent from "../steps/StepEvent";
import StepRole from "../steps/StepRole";
import {
  STEPS,
  type CreateEventData,
  type CreateRoleData,
  type StepType,
} from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Steps } from "@/components/custom/steps";
import { useNavigate } from "react-router-dom";

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
      navigate(`/${data.slug}/admin`);
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
          <CardContent className="pt-6">
            <CreateEventStepper activeStep={activeStep} />

            <Steps
              value={activeStep}
              order={STEPS}
              onChange={(v) => setActiveStep(v as StepType)}
            >
              {activeStep === "Event" && (
                <StepEvent
                  defaultValues={eventData ?? undefined}
                  onNext={(data) => {
                    setEventData(data);
                  }}
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
            </Steps>
          </CardContent>
        </Card>
      </motion.div>
    </LayoutGroup>
  );
};

export default CreateEventForm;
