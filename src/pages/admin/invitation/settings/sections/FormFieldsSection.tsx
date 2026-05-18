import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldTitle } from "@/components/ui/field";
import { SwitchField } from "@/components/custom/form";
import { useFormShell } from "@/components/custom/form";

const FormFieldsSection = () => {
  const { form } = useFormShell();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
          Form Fields
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldTitle>Message</FieldTitle>
            <div className="flex gap-4">
              <SwitchField name="message_visible" label="Show" />
              <form.Subscribe
                selector={(s: { values: { message_visible: boolean } }) =>
                  s.values.message_visible
                }
              >
                {(isVisible: boolean) => (
                  <SwitchField
                    name="message_required"
                    label="Required"
                    disabled={!isVisible}
                  />
                )}
              </form.Subscribe>
            </div>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
};

export default FormFieldsSection;
