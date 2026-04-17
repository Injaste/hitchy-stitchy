import type { FC } from "react"
import { MoreHorizontal, Globe, Pencil, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cardHover } from "@/lib/animations"
import { usePagesModalStore } from "../hooks/usePagesModalStore"
import type { EventPage } from "../types"

interface Props {
  page: EventPage
}

const PageCard: FC<Props> = ({ page }) => {
  const { openRename, openDelete, openPublish } = usePagesModalStore()

  return (
    <motion.div whileHover={cardHover}>
      <Card className="px-5 py-4">
        <CardContent className="p-0 flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm truncate">{page.name}</p>
              {page.is_published && (
                <Badge variant="default" className="text-xs gap-1">
                  <Globe className="h-2.5 w-2.5" />
                  Published
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {page.theme?.name ?? "No theme"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!page.is_published && (
                <DropdownMenuItem onClick={() => openPublish(page)}>
                  <Globe className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => openRename(page)}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => openDelete(page)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PageCard
