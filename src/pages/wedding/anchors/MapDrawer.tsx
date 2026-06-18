import { MapPinned } from "lucide-react"

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

interface MapDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  embedUrl: string | null
  link?: string | null
  address?: string | null
  classNames: AnchorDrawerClassNames
}

const MapDrawer = ({
  open,
  onOpenChange,
  embedUrl,
  link,
  address,
  classNames,
}: MapDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={classNames.content}>
        <DrawerHeader>
          <DrawerTitle className={classNames.title}>Getting there</DrawerTitle>
          {address && (
            <DrawerDescription className={cn("whitespace-pre-line", classNames.description)}>
              {address}
            </DrawerDescription>
          )}
        </DrawerHeader>

        {embedUrl && (
          <div className="px-5">
            <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg", classNames.iframe)}>
              <iframe
                src={embedUrl}
                title="Venue location"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}

        <DrawerFooter>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold uppercase tracking-widest",
                classNames.button,
              )}
            >
              <MapPinned size={16} />
              Open in Maps
            </a>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default MapDrawer
