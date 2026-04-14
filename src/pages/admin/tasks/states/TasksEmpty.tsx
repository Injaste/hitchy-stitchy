import type { FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TasksEmptyProps {
  onAdd: () => void
  canCreate: boolean
}

const TasksEmpty: FC<TasksEmptyProps> = ({ onAdd, canCreate }) => (
  <Card className="border border-border/50 border-dashed ring-0 bg-transparent shadow-none">
    <CardContent className="flex flex-col items-center justify-center text-center py-24 px-8">
      <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center mb-6">
        <div className="w-6 h-6 rounded-full ring-2 ring-muted-foreground/20" />
      </div>

      <h2 className="text-lg font-medium text-foreground mb-2">
        Nothing on the list yet
      </h2>
      <p className="text-muted-foreground text-sm max-w-[26ch] leading-relaxed mb-8">
        Add your first task to keep everything in one place — from florals to final fittings.
      </p>

      {canCreate && (
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add first task
        </Button>
      )}
    </CardContent>
  </Card>
)

export default TasksEmpty
