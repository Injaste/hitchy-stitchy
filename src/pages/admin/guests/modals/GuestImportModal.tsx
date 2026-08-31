import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form";
import { StepsDirection } from "@/components/custom/steps-direction";

import { usePlan } from "../../hooks/usePlan";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestTargetPages } from "../hooks/useGuestTargetPages";
import { useGuestMutations, useGuestsQuery } from "../queries";
import { boundsConflict, pageBounds } from "../pageOptions";
import GuestCapAlert from "../components/GuestCapAlert";
import { phoneKey } from "@/lib/phone";
import {
  buildImportPreview,
  parseGuestText,
  type ColumnMapping,
} from "../parseGuests";
import GuestImportPreview from "./GuestImportPreview";

// Mirrors import_guests' own ceiling, so an oversized list is caught with a
// sentence the user can act on instead of a rejected round trip.
const MAX_BATCH = 1000;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

// An imported guest hasn't answered yet, so they start Pending. The RPC (like
// create_guest) defaults an absent status to Confirmed, which would spend the
// plan's guest cap on people who never replied — so it is always sent explicitly.
const DEFAULT_STATUS = "pending" as const;

const PLACEHOLDER = [
  "Ali Hassan\t+6591234567\t2",
  "Mei Ling Tan\t+6598765432\t1",
  "Ravi Kumar\t+6590001111\t4",
].join("\n");

/**
 * Paste or CSV, one shared preview. Everything is resolved on the client first —
 * columns, duplicates, party-size limits, the plan cap — so the user reads the
 * whole outcome before a single row is written. The import itself is one RPC
 * call that either lands entirely or writes nothing.
 */
const GuestImportModal = () => {
  const isImportOpen = useGuestModalStore((s) => s.isImportOpen);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { pages, focusedPageId } = useGuestTargetPages();
  const { data: guests } = useGuestsQuery();
  const { importGuests } = useGuestMutations();
  const { meter } = usePlan();

  const [step, setStep] = useState<"source" | "preview">("source");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>([]);
  const [targetIds, setTargetIds] = useState<string[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // The dialog stays mounted between opens, so every open starts clean — the
  // mutation included, or the previous import's success state would greet the
  // next one with a ticked submit button.
  const resetImport = importGuests.reset;
  useEffect(() => {
    if (!isImportOpen) return;
    setStep("source");
    setText("");
    setFileName(null);
    setFileError(null);
    setMapping([]);
    setTargetIds(null);
    resetImport();
  }, [isImportOpen, resetImport]);

  useCloseOnSuccess(importGuests.isSuccess, closeAll);

  // Target what the list is showing: the focused segment, else the day's first
  // page — the same seed the Add-guest door uses. One page, not all of them:
  // every extra page rewrites the whole list and spends the cap again, so that
  // is an opt-in through the checklist, not a default.
  const defaultTargets = useMemo(
    () => (focusedPageId ? [focusedPageId] : pages.slice(0, 1).map((p) => p.id)),
    [focusedPageId, pages],
  );
  const targets = targetIds ?? defaultTargets;

  // Parsing runs off the typing path — a 300-row paste re-parses on the deferred
  // value, so the textarea keeps up with the keystroke that triggered it.
  const deferredText = useDeferredValue(text);
  const table = useMemo(() => parseGuestText(deferredText), [deferredText]);

  const selectedPages = pages.filter((p) => targets.includes(p.id));
  const bounds = pageBounds(selectedPages);
  const conflict = boundsConflict(selectedPages);
  const phoneRequired = selectedPages.some((p) => p.mode === "private");

  // Phones per page, whitespace stripped. The server dedups the same way and
  // scopes it to one page, so the preview matches what the write will do.
  const existingByPage = useMemo(() => {
    const byPage = new Map<string, Set<string>>();
    for (const g of guests ?? []) {
      if (!g.invitation_id || !g.phone) continue;
      const set = byPage.get(g.invitation_id) ?? new Set<string>();
      set.add(phoneKey(g.phone));
      byPage.set(g.invitation_id, set);
    }
    return byPage;
  }, [guests]);

  const activeMapping = mapping.length > 0 ? mapping : table.mapping;
  const preview = useMemo(
    () =>
      buildImportPreview(table, {
        mapping: activeMapping,
        targetPageIds: targets,
        existingByPage,
        minGuest: bounds.minGuest,
        maxGuest: bounds.maxGuest,
        phoneRequired,
        defaultStatus: DEFAULT_STATUS,
      }),
    [
      table,
      activeMapping,
      targets,
      existingByPage,
      bounds.minGuest,
      bounds.maxGuest,
      phoneRequired,
    ],
  );

  const { remaining } = meter("guests");
  const overCap = preview.heads > remaining;
  const tooMany = preview.payload.length > MAX_BATCH;
  const canImport =
    targets.length > 0 &&
    preview.payload.length > 0 &&
    !overCap &&
    !tooMany &&
    !conflict;

  const readFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Cleared straight away so the same file can be picked again after a failure.
    e.target.value = "";
    if (!file) return;

    setFileError(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is over 2 MB. Export a shorter list and try again.");
      return;
    }
    try {
      setText(await file.text());
      setFileName(file.name);
    } catch {
      setFileError("We couldn't read that file. Save it as CSV and try again.");
    }
  };

  const toggleTarget = (id: string) =>
    setTargetIds(
      targets.includes(id)
        ? targets.filter((x) => x !== id)
        : [...targets, id],
    );

  if (pages.length === 0) return null;

  return (
    <Dialog open={isImportOpen} onOpenChange={closeAll}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import guests</DialogTitle>
          <DialogDescription>
            Paste your list from a spreadsheet or upload a CSV. You'll see every
            row before anything is added.
          </DialogDescription>
        </DialogHeader>

        <StepsDirection value={step} onChange={setStep}>
          {step === "source" ? (
            <div className="grid gap-3 px-4">
              <Tabs defaultValue="paste">
                <TabsList className="w-full">
                  <TabsTrigger value="paste">Paste</TabsTrigger>
                  <TabsTrigger value="file">CSV file</TabsTrigger>
                </TabsList>
                <TabsContent value="paste">
                  <div className="grid gap-2">
                    <Textarea
                      autoFocus
                      rows={8}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        setFileName(null);
                      }}
                      placeholder={PLACEHOLDER}
                      aria-label="Paste your guest list"
                      className="max-h-56 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      One guest per line. Columns can be separated by tabs or
                      commas, and a header row is optional.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="file">
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-foreground"
                    >
                      <FileUp className="size-4" />
                      {fileName ?? "Choose a .csv file"}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="sr-only"
                      onChange={readFile}
                    />
                    {fileError ? (
                      <p className="text-xs text-destructive">{fileError}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Exported from Sheets, Excel or Numbers — the columns are
                        matched for you.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {text.trim().length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {table.rows.length}{" "}
                  {table.rows.length === 1 ? "row" : "rows"} found
                  {table.header &&
                    `, row ${table.headerLine} used as the header`}
                  {table.titleRows.length > 0 &&
                    ` (skipped ${table.titleRows.length} title ${table.titleRows.length === 1 ? "row" : "rows"} above it)`}
                  .
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {(conflict || overCap || tooMany) && (
                <div className="grid gap-2 px-4">
                  {conflict && (
                    <Alert variant="warning">
                      <AlertTitle>These pages can't share a guest</AlertTitle>
                      <AlertDescription>
                        {conflict.floor.label} needs parties of at least{" "}
                        {conflict.floor.minGuest}, and {conflict.ceiling.label}{" "}
                        allows at most {conflict.ceiling.maxGuest}. Import to one
                        of them, then add the other separately.
                      </AlertDescription>
                    </Alert>
                  )}
                  {overCap && (
                    <GuestCapAlert heads={preview.heads} remaining={remaining} />
                  )}
                  {tooMany && (
                    <Alert variant="destructive">
                      <AlertTitle>That list is too long</AlertTitle>
                      <AlertDescription>
                        An import can hold at most {MAX_BATCH} guests at a time.
                        Split the list and import again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <GuestImportPreview
                table={table}
                preview={preview}
                mapping={activeMapping}
                onMappingChange={setMapping}
                pages={pages}
                targetIds={targets}
                onToggleTarget={toggleTarget}
              />
            </div>
          )}
        </StepsDirection>

        <DialogFooter>
          {step === "source" ? (
            <>
              <Button variant="outline" onClick={closeAll}>
                Cancel
              </Button>
              <Button
                disabled={table.rows.length === 0}
                onClick={() => {
                  setMapping(table.mapping);
                  setStep("preview");
                }}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("source")}>
                Back
              </Button>
              <SubmitButton
                type="button"
                disabled={!canImport}
                isPending={importGuests.isPending}
                isSuccess={importGuests.isSuccess}
                isError={importGuests.isError}
                onClick={() =>
                  importGuests.mutate({
                    invitationIds: targets,
                    guests: preview.payload,
                  })
                }
              >
                Import {preview.counts.ok}{" "}
                {preview.counts.ok === 1 ? "guest" : "guests"}
              </SubmitButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestImportModal;
