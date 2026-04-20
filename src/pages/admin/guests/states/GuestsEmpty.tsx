import type { FC } from "react"
import { Plus, Upload, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface GuestsEmptyProps {
  onAdd: () => void
  onImport: () => void
  canCreate: boolean
}

const GuestsEmpty: FC<GuestsEmptyProps> = ({ onAdd, onImport, canCreate }) => (
  <Card className="border border-border/50 border-dashed ring-0 bg-transparent shadow-none">
    <CardContent className="flex flex-col items-center justify-center text-center py-24 px-8">
      <div className="w-16 h-16 rounded-full bg-muted border border-dashed border-border flex items-center justify-center mb-6">
        <Users className="w-6 h-6 text-muted-foreground/50" />
      </div>

      <h2 className="font-display text-xl font-medium text-foreground mb-2">
        Your guest list starts here
      </h2>
      <p className="text-muted-foreground text-sm max-w-[30ch] leading-relaxed mb-8">
        Add guests one at a time, or import a whole list from a spreadsheet.
      </p>

      {canCreate && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add first guest
          </Button>
          <Button onClick={onImport} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)

export default GuestsEmpty
