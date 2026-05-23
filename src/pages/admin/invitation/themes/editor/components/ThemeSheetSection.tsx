import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
} from "@/components/custom/form";
import { FormShellContext } from "@/components/custom/form/form-context";
import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import { useThemeSheetStore, type ThemeDraftPatch } from "../store";

interface ThemeSheetSectionProps {
  group: ThemeFieldGroup;
}

const ThemeSheetSection = ({ group }: ThemeSheetSectionProps) => {
  const draft = useThemeSheetStore((s) => s.draft);
  const setFields = useThemeSheetStore((s) => s.setFields);

  const setFieldsRef = useRef(setFields);
  setFieldsRef.current = setFields;

  const initialValues = Object.fromEntries(
    group.fields.map((f) => {
      const raw = draft ? (draft as Record<string, unknown>)[f.key] : undefined;
      if (f.type === "switch") return [f.key, raw === "true"];
      return [f.key, typeof raw === "string" ? raw : (f.default ?? "")];
    }),
  );

  const form = useForm({
    defaultValues: initialValues,
    listeners: {
      onChangeDebounceMs: 150,
      onChange: ({ formApi }) => {
        const values = formApi.state.values as Record<string, string | boolean | null>;
        const patch: ThemeDraftPatch = {};
        for (const f of group.fields) {
          const v = values[f.key];
          patch[f.key] =
            f.type === "switch"
              ? v
                ? "true"
                : null
              : typeof v === "string"
                ? v.trim() || null
                : null;
        }
        setFieldsRef.current(patch);
      },
    },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
            {group.title}
          </CardTitle>
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
                case "text":
                case "image":
                default:
                  return (
                    <TextField
                      key={field.key}
                      name={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                    />
                  );
              }
            })}
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default ThemeSheetSection;
