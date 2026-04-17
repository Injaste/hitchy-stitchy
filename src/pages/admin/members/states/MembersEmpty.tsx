import type { FC } from "react"
import { Plus, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MembersEmptyProps {
  onInvite: () => void
  canCreate: boolean
}

const MembersEmpty: FC<MembersEmptyProps> = ({ onInvite, canCreate }) => (
  <Card className="border border-border/50 border-dashed ring-0 bg-transparent shadow-none">
    <CardContent className="flex flex-col items-center justify-center text-center py-24 px-8">
      <div className="w-16 h-16 rounded-full bg-muted border border-dashed border-border flex items-center justify-center mb-6">
        <UserPlus className="w-6 h-6 text-muted-foreground/50" />
      </div>

      <h2 className="font-display text-xl font-medium text-foreground mb-2">
        Build your team
      </h2>
      <p className="text-muted-foreground text-sm max-w-[30ch] leading-relaxed mb-8">
        Invite the people helping you plan, from your maid of honour to your coordinator.
      </p>

      {canCreate && (
        <Button onClick={onInvite} className="gap-2">
          <Plus className="w-4 h-4" />
          Invite first member
        </Button>
      )}
    </CardContent>
  </Card>
)

export default MembersEmpty
