import { ShieldAlert } from "lucide-react";

const PermissionsError = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <ShieldAlert className="w-8 h-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">
      Could not load permission data. Try refreshing the page.
    </p>
  </div>
);

export default PermissionsError;
