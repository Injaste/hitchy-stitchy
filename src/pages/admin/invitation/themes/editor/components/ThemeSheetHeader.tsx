import { X, RotateCw, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { FormShellContext } from "@/components/custom/form/form-context";
import type { Theme, Template } from "../../../types";
import { useThemeSheetStore } from "../store";

interface ThemeSheetHeaderProps {
  theme: Theme;
  template: Template;
  isDirty: boolean;
  isSaving: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  onSave: () => void;
  onClose: () => void;
}

const ThemeSheetHeader = ({
  theme,
  template,
  isDirty,
  isSaving,
  isPending,
  isSuccess,
  isError,
  onSave,
  onClose,
}: ThemeSheetHeaderProps) => {
  const name = useThemeSheetStore((s) => s.name);

  return (
    <div className="flex items-center justify-between gap-4 py-4 bg-background">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close"
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h2 className="text-base font-medium truncate font-display">
              {name || theme.name}
            </h2>
            {theme.published_at && (
              <Badge
                variant="outline"
                className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary border-primary/30"
              >
                Live
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
            <span className="truncate">{template.name}</span>
            {theme.updated_at && (
              <>
                <span aria-hidden>·</span>
                <RotateCw className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {formatDistanceToNow(new Date(theme.updated_at), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
            {theme.published_at && (
              <>
                <span aria-hidden>·</span>
                <Globe className="h-3 w-3 shrink-0 text-primary" />
                <span className="truncate">
                  Published{" "}
                  {formatDistanceToNow(new Date(theme.published_at), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <FormShellContext.Provider
          value={{
            attemptCount: 0,
            // SubmitButton only reads isPending/isSuccess/isError from context;
            // it never touches `form`. Stub satisfies the type.
            form: { Field: () => null } as never,
            isPending,
            isSuccess,
            isError,
          }}
        >
          <SubmitButton size="sm" onClick={onSave} disabled={!isDirty}>
            {theme.published_at ? "Publish" : "Save"}
          </SubmitButton>
        </FormShellContext.Provider>
      </div>
    </div>
  );
};

export default ThemeSheetHeader;
