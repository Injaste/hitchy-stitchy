import { useEffect, useId, useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { toSafeSlug, toSlug } from "@/hooks/useSlugCheck";
import { BASE_URL } from "@/lib/config";

interface PageLinkSectionProps {
  slug: string;
  linkSlug: string | null;
  published: boolean;
  isSaving: boolean;
  isSaveSuccess: boolean;
  isSaveError: boolean;
  onSave: (value: string | null) => void;
}

/**
 * The page's URL identity — saved through its own RPC
 * (set_invitation_link_slug), independent of the invitation form around it.
 *
 * STANDALONE, in the NameField mould: a Field wrapping an Input, with the value
 * held locally. It can't be a FormShell/FormCard — EditPanel already wraps this
 * subtree in a <form>, and React rejects a nested one ("<form> cannot contain a
 * nested <form>"), falling back to a native submit that reloads the page. It
 * can't use useAutosaveField either: autosaving a published page's public URL
 * would fire the destructive-change confirm mid-keystroke.
 */
const PageLinkSection = ({
  slug,
  linkSlug,
  published,
  isSaving,
  isSaveSuccess,
  isSaveError,
  onSave,
}: PageLinkSectionProps) => {
  const inputId = useId();
  const [editing, setEditing] = useState(false);
  const saved = linkSlug ?? "";
  const [value, setValue] = useState(saved);

  // Re-seed and collapse once the saved link changes — i.e. only after a
  // successful save. A failed save leaves the disclosure open with the typed
  // value so the fix happens in place.
  useEffect(() => {
    setValue(saved);
    setEditing(false);
  }, [linkSlug]);

  // Preview off the normalised value: it's what a save will actually persist.
  const normalized = toSlug(value);
  const isRoot = normalized === "";
  const path = `${slug}${normalized ? `/${normalized}` : ""}`;

  // Unchanged is a no-op. Without this, Save on an untouched published page
  // raises the "guests will see a Not found page" confirm for a non-change.
  const commit = () => {
    if (isSaving || normalized === saved) return;
    onSave(normalized || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
          Page link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              {isRoot ? "Main link" : "Custom link"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {BASE_URL}/{path}
            </p>
          </div>
          {!editing && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="shrink-0 gap-1.5"
            >
              <Pencil className="size-3.5" />
              Customise link
            </Button>
          )}
        </div>

        {editing && (
          <Field data-invalid={undefined} className="gap-2 border-t pt-3">
            <FieldLabel htmlFor={inputId} className="text-xs">
              Link path
            </FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                {/* toSafeSlug per keystroke keeps a trailing dash so typing
                    mid-word doesn't fight the user; toSlug strips it at commit.
                    Invalid characters can never land in the field. */}
                <Input
                  id={inputId}
                  value={value}
                  onChange={(e) => setValue(toSafeSlug(e.target.value))}
                  onKeyDown={(e) => {
                    // Enter belongs to this field. preventDefault stops it
                    // implicitly submitting EditPanel's form; stopPropagation
                    // keeps Ctrl-Enter off that form's onKeyDown. Both would
                    // otherwise run "Save as draft" and drop the link edit.
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    e.stopPropagation();
                    commit();
                  }}
                  placeholder="e.g. mehndi"
                  className="h-9"
                  autoFocus
                />
                {published ? (
                  // Published: commit() only opens the confirm modal (decided
                  // in EditPanel), so this button isn't running the mutation
                  // and must not show a pending state.
                  <Button
                    type="button"
                    size="sm"
                    onClick={commit}
                    disabled={isSaving}
                    className="shrink-0"
                  >
                    Save
                  </Button>
                ) : (
                  // Draft: commit() IS the mutation, so this button owns its
                  // pending/success/error state.
                  <SubmitButton
                    type="button"
                    size="sm"
                    onClick={commit}
                    disabled={isSaving}
                    isPending={isSaving}
                    isSuccess={isSaveSuccess}
                    isError={isSaveError}
                    className="w-auto shrink-0"
                  >
                    Save
                  </SubmitButton>
                )}
              </div>
            </FieldContent>
            {/* The only cue that emptying the field gives the main link.
                Dropped at root, where the header already says so. */}
            {!isRoot && (
              <FieldDescription className="text-2xs">
                Leave empty for your event's main link — {BASE_URL}/{slug}
              </FieldDescription>
            )}
          </Field>
        )}
      </CardContent>
    </Card>
  );
};

export default PageLinkSection;
