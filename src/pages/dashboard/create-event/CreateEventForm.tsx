import { useEffect, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepsDirection } from "@/components/custom/steps-direction";

import { releaseSlug, reserveSlug } from "../api";
import { useCreateEventMutation } from "../queries";
import {
  STEPS,
  type CreateDetailsData,
  type CreateDatesData,
  type CreateRoleData,
  type StepType,
} from "../types";

import CreateEventStepper from "./CreateEventStepper";
import SlugHoldNotice from "./SlugHoldNotice";
import StepDetails from "./steps/StepDetails";
import StepDates from "./steps/StepDates";
import StepRole from "./steps/StepRole";

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<StepType>(STEPS[0]);
  const [detailsData, setDetailsData] = useState<CreateDetailsData | null>(null);
  const [datesData, setDatesData] = useState<CreateDatesData | null>(null);
  const [roleData, setRoleData] = useState<Partial<CreateRoleData> | null>(
    null,
  );
  const [holdSlug, setHoldSlug] = useState<string | null>(null);
  const [holdExpiry, setHoldExpiry] = useState<string | null>(null);
  const [refreshingHold, setRefreshingHold] = useState(false);

  const {
    mutateAsync: createEvent,
    isPending,
    error: mutationError,
    isError,
    reset: resetCreateEvent,
  } = useCreateEventMutation();

  // Release the held slug when the wizard unmounts (close / navigate away). On a
  // successful create, create_event has already cleared it, so this is a no-op.
  useEffect(() => () => void releaseSlug(), []);

  const handleSubmit = async (data: CreateRoleData) => {
    if (!detailsData || !datesData) return;
    const result = await createEvent({
      ...detailsData,
      ...datesData,
      ...data,
    }).catch(() => null);
    if (result) navigate(`/${result.slug}/admin`);
  };

  // Near-expiry "Keep it" — re-reserve the currently-held slug (tracked from the
  // reserve-on-change), which slides the hold by another 30 min. Works on any
  // step, including Details before it's committed. Throws if the slug was lost;
  // we clear the notice and let the create check re-validate.
  const handleReserved = (expiry: string, slug: string) => {
    setHoldSlug(slug);
    setHoldExpiry(expiry);
  };

  const handleKeepHold = async () => {
    if (!holdSlug) return;
    setRefreshingHold(true);
    try {
      setHoldExpiry(await reserveSlug(holdSlug));
    } catch {
      setHoldExpiry(null);
    } finally {
      setRefreshingHold(false);
    }
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
          <CardContent>
            <CreateEventStepper activeStep={activeStep} />

            <SlugHoldNotice
              expiry={holdExpiry}
              onRefresh={handleKeepHold}
              refreshing={refreshingHold}
            />

            <StepsDirection
              value={activeStep}
              order={STEPS}
              onChange={(v) => setActiveStep(v as StepType)}
            >
              {activeStep === "Details" && (
                <StepDetails
                  defaultValues={detailsData ?? undefined}
                  onNext={(data) => setDetailsData(data)}
                  onReserved={handleReserved}
                />
              )}

              {activeStep === "Dates" && (
                <StepDates
                  defaultValues={datesData ?? undefined}
                  onNext={(data) => setDatesData(data)}
                  onBack={(data) => setDatesData(data)}
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
                  isSubmitting={isPending}
                  error={mutationError}
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
