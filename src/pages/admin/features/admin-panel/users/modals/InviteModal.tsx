import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";

export function InviteModal() {
  const { teamRoles } = useAdminStore();
  const { isInviteModalOpen, closeInviteModal } = useModalStore();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleClose = () => {
    setName("");
    setRole("");
    setIsAdmin(false);
    closeInviteModal();
  };

  const inviteLink = "https://weddings.cozynosy.com/dan-nad/join?token=placeholder";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  const handleWhatsApp = () => {
    const text = `You've been invited to join the wedding admin dashboard!\n\nClick here to get started: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={isInviteModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send them a link to join this event's admin dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="Their name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="invite-admin"
              checked={isAdmin}
              onCheckedChange={(v) => setIsAdmin(!!v)}
            />
            <label htmlFor="invite-admin" className="text-sm font-medium cursor-pointer">
              Admin access
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button variant="ghost" className="w-full" onClick={handleCopyLink}>
              Copy Invite Link
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleWhatsApp}>
              <MessageCircle className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          </div>

          <p className="text-xs text-muted-foreground italic text-center">
            Real invite tokens will be generated once accounts are set up.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
