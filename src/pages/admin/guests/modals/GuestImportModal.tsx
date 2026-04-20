import { useState } from "react"
import { AnimatePresence } from "framer-motion"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ComponentSlide from "@/components/animations/animate-component-slide"

import { useGuestModalStore } from "../hooks/useGuestModalStore"
import type { ImportResult, ParsedGuestRow } from "../types"

import ImportUploadStep from "./import/ImportUploadStep"
import ImportPreviewStep from "./import/ImportPreviewStep"
import ImportResultStep from "./import/ImportResultStep"

type Step = "upload" | "preview" | "result"

const STEP_ORDER: Record<Step, number> = {
  upload: 0,
  preview: 1,
  result: 2,
}

const GuestImportModal = () => {
  const isImportOpen = useGuestModalStore((s) => s.isImportOpen)
  const closeAll = useGuestModalStore((s) => s.closeAll)

  const [step, setStep] = useState<Step>("upload")
  const [direction, setDirection] = useState<1 | -1 | 0>(0)
  const [parsed, setParsed] = useState<ParsedGuestRow[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)

  const goTo = (next: Step) => {
    setDirection(STEP_ORDER[next] >= STEP_ORDER[step] ? 1 : -1)
    setStep(next)
  }

  const reset = () => {
    setStep("upload")
    setDirection(0)
    setParsed([])
    setResult(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAll()
      // Reset after the dialog animates out so the user doesn't see a flash of step 1.
      setTimeout(reset, 200)
    }
  }

  const titleByStep: Record<Step, string> = {
    upload: "Import guests",
    preview: "Review before importing",
    result: "Import summary",
  }

  const descriptionByStep: Record<Step, string> = {
    upload: "Upload a CSV to add guests in bulk.",
    preview: "Choose what to do with each row before saving.",
    result: "Here's what happened with your import.",
  }

  return (
    <Dialog open={isImportOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titleByStep[step]}</DialogTitle>
          <DialogDescription>{descriptionByStep[step]}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait" custom={direction}>
          {step === "upload" && (
            <ComponentSlide key="upload" direction={direction}>
              <ImportUploadStep
                onParsed={(rows) => {
                  setParsed(rows)
                  goTo("preview")
                }}
                onCancel={() => handleOpenChange(false)}
              />
            </ComponentSlide>
          )}

          {step === "preview" && (
            <ComponentSlide key="preview" direction={direction}>
              <ImportPreviewStep
                parsed={parsed}
                onBack={() => goTo("upload")}
                onComplete={(r) => {
                  setResult(r)
                  goTo("result")
                }}
              />
            </ComponentSlide>
          )}

          {step === "result" && result && (
            <ComponentSlide key="result" direction={direction}>
              <ImportResultStep
                result={result}
                onClose={() => handleOpenChange(false)}
              />
            </ComponentSlide>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default GuestImportModal
