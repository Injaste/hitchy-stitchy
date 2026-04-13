import type { FC } from "react"
import { CheckSquare, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TasksEmptyProps {
  onAdd: () => void
  canCreate: boolean
}

const TasksEmpty: FC<TasksEmptyProps> = ({ onAdd, canCreate }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <CheckSquare className="w-9 h-9 text-primary" />
      </div>
      <h2 className="font-bold text-2xl text-foreground mb-2">No tasks yet</h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        Keep everything on track. Add your first task and start checking things off.
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
