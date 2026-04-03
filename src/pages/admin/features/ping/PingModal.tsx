import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { PING_PRESETS } from "./types";
import type { PingPreset } from "./types";

export function PingModal() {
  const { teamRoles, currentRole, addLog } = useAdminStore();
  const { isPingModalOpen, pingTargetRole, closePingModal } = useModalStore();

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<PingPreset | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    if (isPingModalOpen) {
      setSelectedRole(pingTargetRole ?? "");
      setSelectedPreset(null);
      setCustomMessage("");
    }
  }, [isPingModalOpen, pingTargetRole]);

  const message = customMessage.trim() || selectedPreset || "";

  const handlePresetClick = (preset: PingPreset) => {
    setSelectedPreset(preset);
    setCustomMessage("");
  };

  const handleCustomMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomMessage(e.target.value);
    if (e.target.value) setSelectedPreset(null);
  };

  const handleSend = () => {
    if (!selectedRole || !message) return;
    addLog(currentRole, `Pinged ${selectedRole}: ${message}`);
    toast.success(`Pinged ${selectedRole}!`);
    closePingModal();
  };

  return (
    <Dialog open={isPingModalOpen} onOpenChange={closePingModal}>
      <DialogContent className="w-[95vw] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Ping a Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Role selector */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role…" />
              </SelectTrigger>
              <SelectContent>
                {teamRoles.map((r) => (
                  <SelectItem key={r.role} value={r.role}>
                    {r.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick message presets */}
          <div className="space-y-1.5">
            <Label>Quick message</Label>
            <div className="flex flex-wrap gap-2">
              {PING_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors",
                    selectedPreset === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom message */}
          <div className="space-y-1.5">
            <Label>Custom message (optional)</Label>
            <Input
              placeholder="Type a custom message…"
              value={customMessage}
              onChange={handleCustomMessageChange}
            />
          </div>

          {/* Send button */}
          <Button
            className="w-full"
            disabled={!selectedRole || !message}
            onClick={handleSend}
          >
            Send Ping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
