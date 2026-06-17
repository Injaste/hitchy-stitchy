import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
  DateField,
  TimeField,
} from "@/components/custom/form";
import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useThemeSheetStore } from "../store";
import ImageUploadField from "./ImageUploadField";
import FontSelectField from "./FontSelectField";
import SectionListField from "./SectionListField";

interface ThemeSheetSectionProps {
  group: ThemeFieldGroup;
}

// One design section = one Card of fields, bound to the unified edit form (via
// FormShellContext provided by EditPanel). No own form — values live on the one
// invitation form; defaults are seeded there.
const ThemeSheetSection = ({ group }: ThemeSheetSectionProps) => {
  const themeId = useThemeSheetStore((s) => s.themeId);
  const eventId = useAdminStore((s) => s.eventId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
          {group.title}
        </CardTitle>
        {group.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {group.description}
            {group.descriptionUrl && group.descriptionUrlLabel && (
              <>
                {" — "}
                <a
                  href={group.descriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {group.descriptionUrlLabel}
                </a>
              </>
            )}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {group.fields.map((field) => {
            switch (field.type) {
              case "textarea":
                return (
                  <TextareaField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    rows={3}
                    hint={field.hint ? <span>{field.hint}</span> : undefined}
                  />
                );
              case "select":
                return (
                  <SelectField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    options={field.options ?? []}
                    nullable
                  />
                );
              case "switch":
                return (
                  <SwitchField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                  />
                );
              case "image":
                return (
                  <ImageUploadField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    eventId={eventId}
                    themeId={themeId ?? ""}
                    hint={field.hint ? <span>{field.hint}</span> : undefined}
                  />
                );
              case "font":
                return (
                  <FontSelectField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    hint={field.hint ? <span>{field.hint}</span> : undefined}
                  />
                );
              case "date":
                return (
                  <DateField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                  />
                );
              case "time":
                return (
                  <TimeField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                  />
                );
              case "section-list":
                return <SectionListField key={field.key} field={field} />;
              case "text":
              default:
                return (
                  <TextField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    hint={
                      field.hint ? (
                        <span>
                          {field.hint}
                          {field.hintUrl && field.hintUrlLabel && (
                            <>
                              {" — "}
                              <a
                                href={field.hintUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 hover:text-foreground transition-colors"
                              >
                                {field.hintUrlLabel}
                              </a>
                            </>
                          )}
                        </span>
                      ) : undefined
                    }
                  />
                );
            }
          })}
        </FieldGroup>
      </CardContent>
    </Card>
  );
};

export default ThemeSheetSection;
