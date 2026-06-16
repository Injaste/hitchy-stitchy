import type { AnyFieldApi } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormShell } from "@/components/custom/form/form-context";
import type {
  ThemeFieldSchema,
  SectionListValue,
  SectionListItem,
} from "@/pages/wedding/templates/types";

interface SectionListFieldProps {
  field: ThemeFieldSchema;
}

// Nested repeater: titled sections, each with rows keyed by field.itemFields.
// Holds a typed array directly on the unified edit form (via form.Field).
const SectionListField = ({ field }: SectionListFieldProps) => {
  const { form } = useFormShell();
  const FormField = form.Field;
  const itemFields = field.itemFields ?? [];
  const emptyItem = (): SectionListItem =>
    Object.fromEntries(itemFields.map((f) => [f.key, ""]));

  return (
    <FormField name={field.key}>
      {(api: AnyFieldApi) => {
        const sections: SectionListValue = Array.isArray(api.state.value)
          ? (api.state.value as SectionListValue)
          : [];
        const commit = (next: SectionListValue) => api.handleChange(next);

        const addSection = () =>
          commit([...sections, { title: "", items: [emptyItem()] }]);
        const removeSection = (si: number) =>
          commit(sections.filter((_, i) => i !== si));
        const setTitle = (si: number, title: string) =>
          commit(sections.map((s, i) => (i === si ? { ...s, title } : s)));
        const addItem = (si: number) =>
          commit(
            sections.map((s, i) =>
              i === si ? { ...s, items: [...s.items, emptyItem()] } : s,
            ),
          );
        const removeItem = (si: number, ii: number) =>
          commit(
            sections.map((s, i) =>
              i === si
                ? { ...s, items: s.items.filter((_, j) => j !== ii) }
                : s,
            ),
          );
        const setItem = (si: number, ii: number, key: string, value: string) =>
          commit(
            sections.map((s, i) =>
              i === si
                ? {
                    ...s,
                    items: s.items.map((it, j) =>
                      j === ii ? { ...it, [key]: value } : it,
                    ),
                  }
                : s,
            ),
          );

        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium leading-snug select-text">
              {field.label}
            </label>

            <div className="space-y-3">
              {sections.map((section, si) => (
                <div
                  key={si}
                  className="rounded-lg border bg-muted/20 p-3 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={section.title}
                      onChange={(e) => setTitle(si, e.target.value)}
                      placeholder="Section title (e.g. Akad Nikah)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(si)}
                      aria-label="Remove section"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        {itemFields.map((f) => (
                          <Input
                            key={f.key}
                            value={item[f.key] ?? ""}
                            onChange={(e) =>
                              setItem(si, ii, f.key, e.target.value)
                            }
                            placeholder={f.placeholder ?? f.label}
                            className="flex-1"
                          />
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(si, ii)}
                          aria-label="Remove row"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(si)}
                      className="gap-1.5"
                    >
                      <Plus className="size-3.5" />
                      Add row
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
                className="w-full gap-1.5"
              >
                <Plus className="size-4" />
                Add section
              </Button>
            </div>

            {field.hint && (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            )}
          </div>
        );
      }}
    </FormField>
  );
};

export default SectionListField;
