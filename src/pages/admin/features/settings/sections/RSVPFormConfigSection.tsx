import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { fadeUp } from "@/pages/admin/animations";
import { useSettings, useRSVPFormMutation } from "../queries";
import type { RSVPFormConfig, RSVPFieldConfig, RSVPMode } from "../types";

const DEFAULT_FORM: RSVPFormConfig = {
  mode: "open",
  fields: [
    { id: "name", label: "Name", visible: true, required: true },
    { id: "phone", label: "Phone", visible: true, required: false },
    { id: "guestCount", label: "Number of guests", visible: true, required: false },
    { id: "dietary", label: "Dietary notes", visible: true, required: false },
    { id: "meal", label: "Meal choice", visible: false, required: false },
    { id: "message", label: "Special message", visible: true, required: false },
  ],
  confirmationMessage: "Thank you! We can't wait to celebrate with you. 💕",
  minGuests: 1,
  maxGuests: 5,
};

export function RSVPFormConfigSection() {
  const { data: settings } = useSettings();
  const [form, setForm] = useState<RSVPFormConfig>(DEFAULT_FORM);

  useEffect(() => {
    if (settings?.rsvpForm) setForm(settings.rsvpForm);
  }, [settings]);

  const { mutate: save, isPending } = useRSVPFormMutation();

  const updateField = (id: string, patch: Partial<RSVPFieldConfig>) =>
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0.1)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">RSVP Form Config</CardTitle>
          </div>
          <CardDescription>
            Control which fields appear on the RSVP form and how guests can respond.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Field visibility */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Field visibility</h4>
            <div className="rounded-lg border border-border overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-4 py-2 bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Field</span>
                <span className="text-center">Visible</span>
                <span className="text-center">Required</span>
              </div>
              {form.fields.map((field) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_80px_80px] gap-2 items-center px-4 py-3 border-b border-border last:border-0"
                >
                  <span className="text-sm">{field.label}</span>
                  <div className="flex justify-center">
                    <Switch
                      checked={field.visible}
                      onCheckedChange={(v) =>
                        updateField(field.id, {
                          visible: v,
                          required: v ? field.required : false,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={field.required}
                      disabled={!field.visible}
                      onCheckedChange={(v) => updateField(field.id, { required: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* RSVP mode */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">RSVP mode</h4>
            <RadioGroup
              value={form.mode}
              onValueChange={(v) => setForm((p) => ({ ...p, mode: v as RSVPMode }))}
              className="space-y-2"
            >
              {[
                {
                  value: "open",
                  label: "Open",
                  description: "Anyone with the link can RSVP.",
                },
                {
                  value: "pool",
                  label: "Guest pool only",
                  description: "Only pre-approved guests can RSVP.",
                },
                {
                  value: "pool-open",
                  label: "Pool priority",
                  description:
                    "Pool guests get priority; overflow RSVPs are accepted.",
                },
              ].map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`mode-${opt.value}`}
                  className="flex items-start gap-3 rounded-lg border border-border px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`mode-${opt.value}`}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Confirmation message */}
          <div className="space-y-2">
            <Label htmlFor="confirmMsg">Confirmation message</Label>
            <Textarea
              id="confirmMsg"
              value={form.confirmationMessage}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirmationMessage: e.target.value }))
              }
              rows={3}
              placeholder="Thank you for your response!"
            />
          </div>

          {/* Guest count constraints */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minGuests">Min guests per RSVP</Label>
              <Input
                id="minGuests"
                type="number"
                min={1}
                value={form.minGuests}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minGuests: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max guests per RSVP</Label>
              <Input
                id="maxGuests"
                type="number"
                min={1}
                value={form.maxGuests}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxGuests: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => save(form)} disabled={isPending} size="sm">
              {isPending ? "Saving…" : "Save RSVP config"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
