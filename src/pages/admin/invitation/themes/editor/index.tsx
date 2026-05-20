import { useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollView } from "@/components/custom/scroll-view";
import Container from "@/components/custom/container";
import { Separator } from "@/components/ui/separator";
import { useThemeWithTemplate } from "../../queries";
import { useThemeSheetStore } from "./store";
import { useThemeMutations } from "./queries";
import { useSheetLeaveGuard } from "./hooks/useThemeSheetLeaveGuard";
import ThemeSheetHeader from "./components/ThemeSheetHeader";
import ThemeSheetForm from "./components/ThemeSheetForm";
import ThemeSheetPreview from "./components/ThemeSheetPreview";

interface ThemeEditorSheetProps {
  themeId: string | null;
  open: boolean;
  onClose: () => void;
}

const ThemeEditorSheet = ({
  themeId,
  open,
  onClose,
}: ThemeEditorSheetProps) => {
  const selected = useThemeWithTemplate(themeId);
  const init = useThemeSheetStore((s) => s.init);
  const clear = useThemeSheetStore((s) => s.clear);
  const reset = useThemeSheetStore((s) => s.reset);
  const isDirty = useThemeSheetStore((s) => s.isDirty);
  const storeThemeId = useThemeSheetStore((s) => s.themeId);
  const {
    save,
    isPending,
    isSuccess,
    isError,
    reset: resetMutation,
  } = useThemeMutations();

  useEffect(() => {
    if (!open || !selected) return;
    init(selected.theme.id, selected.theme.config, selected.theme.name);
    return () => clear();
  }, [open, selected?.theme.id, init, clear]);

  // Auto-close on save success (matches FormDialog's closeDelay behaviour).
  // Delay lets the SubmitButton finish its success transition before the
  // sheet slides out.
  useEffect(() => {
    if (!isSuccess) return;
    const id = setTimeout(() => onClose(), 600);
    return () => clearTimeout(id);
  }, [isSuccess, onClose]);

  // Reset mutation flags after the sheet finishes closing so the next open
  // starts in idle state.
  useEffect(() => {
    if (open) return;
    const id = setTimeout(() => resetMutation(), 250);
    return () => clearTimeout(id);
  }, [open, resetMutation]);

  const { attemptClose, modal, isSaving } = useSheetLeaveGuard({
    isDirty,
    onSave: async () => {
      await save();
    },
    onDiscard: reset,
    onClose,
  });

  const handleSave = () => {
    save().catch(() => {
      // toast handled in save hook; isError drives the SubmitButton state
    });
  };

  const isReady = !!selected && storeThemeId === selected.theme.id;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && attemptClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="max-w-6xl! w-screen! p-0 flex flex-col bg-background gap-0"
      >
        <SheetTitle className="sr-only">Edit theme</SheetTitle>

        {isReady && selected && (
          <>
            <Container size="none" className="px-3 md:px-6">
              <ThemeSheetHeader
                theme={selected.theme}
                template={selected.template}
                isDirty={isDirty}
                isSaving={isSaving}
                isPending={isPending}
                isSuccess={isSuccess}
                isError={isError}
                onSave={handleSave}
                onClose={attemptClose}
              />
            </Container>

            <Separator />

            <div className="flex-1 min-h-0 grid grid-rows-1 grid-cols-1 lg:grid-cols-[minmax(450px,1fr)_minmax(450px,1fr)] overflow-hidden">
              <ScrollView gradientTop gradientBottom className="py-6">
                <Container
                  size="none"
                  className="flex flex-col min-h-0 px-3 md:px-6"
                >
                  <ThemeSheetForm
                    key={selected.theme.id}
                    schema={selected.entry.schema}
                  />
                </Container>
              </ScrollView>
              {/* Editorial Warm Sand/Clay variant */}
              <div
                // className="hidden lg:block border-l bg-secondary/40 overflow-hidden relative"
                className="hidden lg:block border-l overflow-hidden relative"
                style={{
                  backgroundImage: `
                    radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0),
                    radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0)
                  `,
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 4px 4px",
                }}
              >
                {/* A soft wash of light across the texture */}
                {/* <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent pointer-events-none" /> */}

                <ThemeSheetPreview theme={selected.theme} />
              </div>
            </div>
          </>
        )}

        {modal}
      </SheetContent>
    </Sheet>
  );
};

export default ThemeEditorSheet;

// TODO LET SHEET RENDER FIRST AND THEN LOAD IFRAME OR ANYTHING THAT WONT CAUSE ANIMATION LAGGING
