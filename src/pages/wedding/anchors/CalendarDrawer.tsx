import { CalendarPlus, Download } from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

import type { AnchorDrawerClassNames } from "./types"
import { buildGoogleCalendarUrl, buildIcs, downloadIcs } from "./calendar"

interface CalendarDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  start: Date
  end: Date | null
  location?: string | null
  dateLabel: string
  classNames: AnchorDrawerClassNames
}

const CalendarDrawer = ({
  open,
  onOpenChange,
  title,
  start,
  end,
  location,
  dateLabel,
  classNames,
}: CalendarDrawerProps) => {
  const googleUrl = buildGoogleCalendarUrl({ title, start, end, location })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={classNames.content}>
        <DrawerHeader>
          <DrawerTitle className={classNames.title}>Add to calendar</DrawerTitle>
          <DrawerDescription className={classNames.description}>
            {dateLabel}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold uppercase tracking-widest",
              classNames.button,
            )}
          >
            <CalendarPlus size={16} />
            Google Calendar
          </a>
          <button
            type="button"
            onClick={() =>
              downloadIcs(
                "wedding.ics",
                buildIcs({ title, start, end, location }),
              )
            }
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold uppercase tracking-widest cursor-pointer",
              classNames.buttonOutline,
            )}
          >
            <Download size={16} />
            Apple / Outlook
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CalendarDrawer
