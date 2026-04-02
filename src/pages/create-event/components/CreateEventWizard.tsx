import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { stepEnter, stepExit } from "../animations"
import { useCreateEventMutation } from "../queries"
import CreateEventStepper from "./CreateEventStepper"
import { StepEvent } from "../steps/StepEvent"
import { StepRole } from "../steps/StepRole"
import type { EventData } from "../types"

export default function CreateEventWizard() {
  const [step, setStep] = useState<1 | 2>(1)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const mutation = useCreateEventMutation()

  return (
    <div>
      <CreateEventStepper step={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={{ ...stepEnter, ...stepExit }}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <StepEvent
              defaultValues={eventData ?? undefined}
              onNext={(data) => { setEventData(data); setStep(2) }}
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
            <StepRole
              onBack={() => setStep(1)}
              onSubmit={(roleData) => {
                if (!eventData) return
                mutation.mutate({ ...eventData, ...roleData })
              }}
              isSubmitting={mutation.isPending}
              error={mutation.error?.message ?? null}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
