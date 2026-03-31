import { useState } from "react";
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
import { fadeUp } from "@/pages/planner/animations";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { toast } from "sonner";
import type { RSVPFormConfig, RSVPFieldConfig } from "../types";

type FieldKey = keyof RSVPFormConfig["fields"];

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "Full Name",
  phone: "Phone Number",
  guestsCount: "Number of Guests",
  dietaryNotes: "Dietary Notes",
  mealChoice: "Meal Choice",
  message: "Message",
};

export function RSVPFormConfigSection() {
  const { eventConfig, setEventConfig } = useAdminStore();
  const [form, setForm] = useState<RSVPFormConfig>(eventConfig.rsvpForm);

  const updateField = (key: FieldKey, patch: Partial<RSVPFieldConfig>) =>
    setForm((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: { ...prev.fields[key], ...patch },
      },
    }));

  const handleSave = () => {
    setEventConfig({ ...eventConfig, rsvpForm: form });
    toast.success("RSVP settings saved");
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0.1)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">
              RSVP Form Config
            </CardTitle>
          </div>
          <CardDescription>
            Control which fields guests see when submitting their RSVP.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form Fields table */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Form Fields</h4>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-4 py-2 bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Field</span>
                <span className="text-center">Visible</span>
                <span className="text-center">Required</span>
              </div>
              {(Object.keys(form.fields) as FieldKey[]).map((key) => {
                const field = form.fields[key];
                return (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_80px_80px] gap-2 items-center px-4 py-3 border-b border-border last:border-0"
                  >
                    <span className="text-sm">{FIELD_LABELS[key]}</span>
                    <div className="flex justify-center">
                      <Switch
                        checked={field.visible}
                        onCheckedChange={(v) =>
                          updateField(key, {
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
                        onCheckedChange={(v) =>
                          updateField(key, { required: v })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* RSVP mode */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">RSVP Mode</h4>
            <RadioGroup
              value={form.mode}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, mode: v as RSVPFormConfig["mode"] }))
              }
              className="space-y-2"
            >
              {[
                {
                  value: "open",
                  label: "Open",
                  description: "Anyone can RSVP",
                },
                {
                  value: "pool",
                  label: "Pool",
                  description: "Pre-approved guests only",
                },
                {
                  value: "pool-open",
                  label: "Pool Open",
                  description: "Pool gets priority, overflow allowed",
                },
              ].map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`rsvp-mode-${opt.value}`}
                  className="flex items-start gap-3 rounded-lg border border-border px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`rsvp-mode-${opt.value}`}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Guest count constraints */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestMin">Min guests per RSVP</Label>
              <Input
                id="guestMin"
                type="number"
                min={1}
                value={form.guestMin}
                onChange={(e) =>
                  setForm((p) => ({ ...p, guestMin: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestMax">Max guests per RSVP</Label>
              <Input
                id="guestMax"
                type="number"
                min={1}
                max={99}
                value={form.guestMax}
                onChange={(e) =>
                  setForm((p) => ({ ...p, guestMax: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          {/* Confirmation message */}
          <div className="space-y-2">
            <Label htmlFor="confirmMsg">Confirmation Message</Label>
            <p className="text-xs text-muted-foreground">
              Shown to guests after they submit their RSVP.
            </p>
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

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} size="sm">
              Save RSVP settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
