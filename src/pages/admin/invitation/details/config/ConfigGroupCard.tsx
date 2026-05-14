import { useRef, type FC } from "react";
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
import type { ThemeDraftValues } from "../../store/useInvitationStore";

interface ConfigGroupCardProps {
  group: ThemeFieldGroup;
  config: ThemeDraftValues;
  onUpdate: (patch: ThemeDraftValues) => void;
}

const ConfigGroupCard: FC<ConfigGroupCardProps> = ({ group, config, onUpdate }) => {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const form = useForm({
    defaultValues: Object.fromEntries(
      group.fields.map((f) => [
        f.key,
        f.type === "switch" ? config[f.key] === "true" : (config[f.key] ?? ""),
      ]),
    ),
    listeners: {
      onChangeDebounceMs: 150,
      onChange: ({ formApi }) => {
        const values = formApi.state.values as Record<string, string | boolean | null>;
        const patch: ThemeDraftValues = {};
        for (const f of group.fields) {
          const v = values[f.key];
          patch[f.key] =
            f.type === "switch"
              ? v ? "true" : null
              : typeof v === "string" ? v.trim() || null : null;
        }
        onUpdateRef.current(patch);
      },
    },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{group.title}</CardTitle>
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

export default ConfigGroupCard;
