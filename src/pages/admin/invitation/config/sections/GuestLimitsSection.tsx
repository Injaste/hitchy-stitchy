import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/custom/form";
import { usePlan } from "@/pages/admin/hooks/usePlan";

const GuestLimitsSection = () => {
  // Per-page "total guests" can't exceed the plan's guest cap (update_invitation
  // clamps it server-side) — surface that ceiling as a right-aligned label hint
  // and cap the input, so it's clear up front rather than failing on save.
  const { limits } = usePlan();
  const planMax = limits.maxGuests;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
          Guest Limits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <TextField
            name="max_guests"
            labelClassName="flex w-full items-center gap-2"
            label={
              <>
                Total guests
                <Badge
                  variant="outline"
                  className="h-4 px-1.5 py-0 font-normal text-2xs"
                >
                  Optional
                </Badge>
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Plan limit {planMax.toLocaleString()}
                </span>
              </>
            }
            placeholder="No limit"
            type="number"
            min={1}
            max={planMax}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="guest_count_min"
              label="Min party size"
              type="number"
              min={1}
              max={99}
            />
            <TextField
              name="guest_count_max"
              label="Max party size"
              type="number"
              min={1}
              max={99}
            />
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
};

export default GuestLimitsSection;
