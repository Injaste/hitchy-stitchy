import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import type { RSVP } from "@/lib/data";

export function ManualRSVPModal() {
  const { rsvps, setRsvps, currentRole, addLog } = useAdminStore();
  const { isManualRSVPModalOpen, closeManualRSVPModal } = useModalStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("1");
  const [dietary, setDietary] = useState("");
  const [status, setStatus] = useState<RSVP["status"]>("Confirmed");
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setName("");
    setPhone("");
    setGuests("1");
    setDietary("");
    setStatus("Confirmed");
    setNotes("");
    closeManualRSVPModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRsvp: RSVP = {
      id: `manual-${Date.now()}`,
      name: name.trim(),
      email: "",
      phone: phone.trim(),
      guests: Math.max(1, parseInt(guests, 10) || 1),
      status,
      dietaryRequirements: dietary.trim() || undefined,
      notes: notes.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };
    setRsvps([...rsvps, newRsvp]);
    toast.success("RSVP added manually");
    addLog(currentRole, `Manual RSVP added for ${name.trim()}`);
    handleClose();
  };

  return (
    <Dialog open={isManualRSVPModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-sm">
        <DialogHeader>
          <DialogTitle>Manual RSVP Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input
              required
              type="tel"
              placeholder="+60 12-345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Number of guests</Label>
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Dietary notes</Label>
            <Input
              placeholder="e.g. Vegetarian, Halal only…"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as RSVP["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Internal notes</Label>
            <Textarea
              placeholder="Admin notes (not visible to guest)…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add RSVP
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
