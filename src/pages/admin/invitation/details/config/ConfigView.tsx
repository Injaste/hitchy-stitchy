import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UniqueMuslimPageConfig } from "@/pages/templates/themes/unique-muslim/types";

interface ConfigViewProps {
  config: UniqueMuslimPageConfig | undefined;
  onUpdate: (patch: Partial<UniqueMuslimPageConfig>) => void;
}

const ConfigView: FC<ConfigViewProps> = ({ config, onUpdate }) => (
  <div className="space-y-3 px-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Opening</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <Field>
            <FieldLabel>Greeting</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. السلام عليكم"
                value={config?.greeting ?? ""}
                onChange={(e) => onUpdate({ greeting: e.target.value || null })}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Quote / Verse</FieldLabel>
            <FieldContent>
              <Textarea
                rows={2}
                placeholder="e.g. And We created you in pairs."
                value={config?.quote ?? ""}
                onChange={(e) => onUpdate({ quote: e.target.value || null })}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Quote Source</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Surah An-Naba 78:8"
                value={config?.quote_source ?? ""}
                onChange={(e) =>
                  onUpdate({ quote_source: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Invitation</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <Field>
            <FieldLabel>Section Title</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. A Journey of Love"
                value={config?.section_title ?? ""}
                onChange={(e) =>
                  onUpdate({ section_title: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Invitation Body</FieldLabel>
            <FieldContent>
              <Textarea
                rows={3}
                placeholder="In the name of Allah..."
                value={config?.invitation_body ?? ""}
                onChange={(e) =>
                  onUpdate({ invitation_body: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Dress Code / Attire</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Traditional Malay — Shades of Green"
                value={config?.attire ?? ""}
                onChange={(e) => onUpdate({ attire: e.target.value || null })}
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Blessings</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Hj Ahmad & Hjh Ramlah"
                  value={config?.blessings_name ?? ""}
                  onChange={(e) =>
                    onUpdate({ blessings_name: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Label</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Parents of the Groom"
                  value={config?.blessings_label ?? ""}
                  onChange={(e) =>
                    onUpdate({ blessings_label: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Visual</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <Field>
            <FieldLabel>Background Image</FieldLabel>
            <FieldContent>
              <Input
                placeholder="/image.png or https://..."
                value={config?.background_image ?? ""}
                onChange={(e) =>
                  onUpdate({ background_image: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
);

export default ConfigView;
