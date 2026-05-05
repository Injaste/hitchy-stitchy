import type { FC } from "react";
import { Plus, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ThemesEmptyProps {
  onAdd: () => void;
  canCreate: boolean;
}

const ThemesEmpty: FC<ThemesEmptyProps> = ({ onAdd, canCreate }) => (
  <Card className="border border-border/50 border-dashed ring-0 bg-transparent shadow-none">
    <CardContent className="flex flex-col items-center justify-center text-center py-24 px-8">
      <div className="w-16 h-16 rounded-full bg-muted border border-dashed border-border flex items-center justify-center mb-6">
        <Shield className="w-6 h-6 text-muted-foreground/50" />
      </div>

      <h2 className="font-display text-xl font-medium text-foreground mb-2">
        No roles yet
      </h2>
      <p className="text-muted-foreground text-sm max-w-[30ch] leading-relaxed mb-8">
        Shape the team around your day. Add roles for anyone helping bring your
        wedding to life.
      </p>

      {canCreate && (
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add first role
        </Button>
      )}
    </CardContent>
  </Card>
);

export default ThemesEmpty;
