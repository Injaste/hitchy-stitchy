import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextareaField } from "@/components/custom/form";

const ConfirmationSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
        Confirmation Message
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <TextareaField
          name="confirmation_message"
          label="Shown after a guest RSVPs"
          placeholder="We look forward to celebrating with you!"
          rows={3}
        />
      </FieldGroup>
    </CardContent>
  </Card>
);

export default ConfirmationSection;
