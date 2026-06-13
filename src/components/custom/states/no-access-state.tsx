import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const NoAccessState = () => (
  <Card className="border-dashed shadow-none">
    <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-20 h-20 rounded-full bg-muted border border-destructive/20 flex items-center justify-center mb-6">
        <Lock className="w-9 h-9 text-destructive" />
      </div>
      <h2 className="font-bold text-2xl text-destructive mb-2 uppercase">
        No access
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        You don't have permission to view this section.
        <br />
        Contact the organizer if you need access.
      </p>
    </CardContent>
  </Card>
);

export default NoAccessState;
