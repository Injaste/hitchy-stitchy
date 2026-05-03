import { useEffect, useMemo } from "react";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInvitationDraftStore } from "../../store/useInvitationDraftStore";
import type { ThemeConfig } from "@/pages/templates/themes/types";
import type { UniqueMuslimPageConfig } from "@/pages/templates/themes/unique-muslim/types";

const ContentSection = () => {
  const pages = useInvitationDraftStore((s) => s.serverThemes);
  const selectedPageId = useInvitationDraftStore((s) => s.selectedPageId);
  const pageDraft = useInvitationDraftStore((s) => s.pageDraft);
  const setPage = useInvitationDraftStore((s) => s.setPage);

  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  useEffect(() => {
    if (!selectedPage || pageDraft) return;
    setPage(selectedPage.config);
  }, [selectedPage?.id, pageDraft, setPage, selectedPage]);

  const themeSlug = pageDraft?._theme_slug ?? selectedPage?.config?._theme_slug;

  if (!themeSlug) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground text-center">
        Select a template to configure its content.
      </p>
    );
  }

  if (themeSlug !== "unique-muslim") return null;

  const cur = (
    pageDraft?._theme_slug === "unique-muslim"
      ? pageDraft
      : selectedPage?.config
  ) as UniqueMuslimPageConfig | undefined;

  const upd = (patch: Partial<UniqueMuslimPageConfig>) => {
    const base: ThemeConfig = pageDraft ??
      selectedPage?.config ?? { _theme_slug: "unique-muslim" };
    setPage({ ...base, ...patch });
  };

  return (
    <div className="p-4">
      <FieldGroup className="block space-y-4">
        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Opening Greeting</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. السلام عليكم"
                value={cur?.greeting ?? ""}
                onChange={(e) => upd({ greeting: e.target.value || null })}
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Quote / Verse</FieldLabel>
            <FieldContent>
              <Textarea
                rows={2}
                placeholder="e.g. And We created you in pairs."
                value={cur?.quote ?? ""}
                onChange={(e) => upd({ quote: e.target.value || null })}
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Quote Source</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Surah An-Naba 78:8"
                value={cur?.quote_source ?? ""}
                onChange={(e) => upd({ quote_source: e.target.value || null })}
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Section Title</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. A Journey of Love"
                value={cur?.section_title ?? ""}
                onChange={(e) => upd({ section_title: e.target.value || null })}
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Invitation Body</FieldLabel>
            <FieldContent>
              <Textarea
                rows={3}
                placeholder="In the name of Allah..."
                value={cur?.invitation_body ?? ""}
                onChange={(e) =>
                  upd({ invitation_body: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Dress Code / Attire</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Traditional Malay — Shades of Green"
                value={cur?.attire ?? ""}
                onChange={(e) => upd({ attire: e.target.value || null })}
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <div className="grid grid-cols-2 gap-3">
          <AnimateItem hasError={false} attemptCount={0}>
            <Field>
              <FieldLabel>Blessings — Name</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Hj Ahmad & Hjh Ramlah"
                  value={cur?.blessings_name ?? ""}
                  onChange={(e) =>
                    upd({ blessings_name: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
          </AnimateItem>
          <AnimateItem hasError={false} attemptCount={0}>
            <Field>
              <FieldLabel>Blessings — Label</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Parents of the Groom"
                  value={cur?.blessings_label ?? ""}
                  onChange={(e) =>
                    upd({ blessings_label: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
          </AnimateItem>
        </div>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Background Image</FieldLabel>
            <FieldContent>
              <Input
                placeholder="/image.png or https://..."
                value={cur?.background_image ?? ""}
                onChange={(e) =>
                  upd({ background_image: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
        </AnimateItem>
      </FieldGroup>
    </div>
  );
};

export default ContentSection;
