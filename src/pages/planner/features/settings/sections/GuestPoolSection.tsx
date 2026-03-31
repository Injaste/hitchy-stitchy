import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Upload, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fadeUp } from "@/pages/planner/animations";
import { useSettings, useGuestPoolMutation } from "../queries";
import type { GuestEntry } from "../types";

function parseGuestList(raw: string): GuestEntry[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        id: `guest-${Date.now()}-${i}`,
        name: parts[0] || "Unknown",
        phone: parts[1] || undefined,
        status: "unclaimed" as const,
      };
    });
}

export function GuestPoolSection() {
  const { data: settings } = useSettings();
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (settings?.guestPool) setGuests(settings.guestPool);
  }, [settings]);

  const { mutate: save, isPending } = useGuestPoolMutation();

  const handleImport = () => {
    const parsed = parseGuestList(input);
    if (parsed.length === 0) return;
    const merged = [
      ...guests,
      ...parsed.filter((p) => !guests.some((g) => g.name === p.name)),
    ];
    setGuests(merged);
    setInput("");
  };

  const removeGuest = (id: string) =>
    setGuests((prev) => prev.filter((g) => g.id !== id));

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0.2)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">Guest Pool</CardTitle>
          </div>
          <CardDescription>
            Pre-approve guests for pool-mode RSVPs. One name per line.
            Optionally add phone:{" "}
            <code className="text-xs bg-muted px-1 rounded">Name, +601x</code>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Import textarea */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              "Ahmad Ibrahim\nSiti Rahmah, +60123456789\nDanial Fariz"
            }
            rows={5}
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={!input.trim()}
            className="gap-2"
          >
            <Upload className="h-3.5 w-3.5" />
            Import guests
          </Button>

          {/* Preview table */}
          {guests.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {guests.length} guest{guests.length !== 1 ? "s" : ""} in
                    pool
                  </p>
                  <Button
                    onClick={() => save(guests)}
                    disabled={isPending}
                    size="sm"
                  >
                    {isPending ? "Saving…" : "Save pool"}
                  </Button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_120px_100px_36px] gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
                  <span>Name</span>
                  <span>Phone</span>
                  <span>Status</span>
                  <span />
                </div>

                <ScrollArea className="max-h-72">
                  <div className="space-y-1">
                    {guests.map((g) => (
                      <div
                        key={g.id}
                        className="grid grid-cols-[1fr_120px_100px_36px] gap-2 items-center px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-sm truncate">{g.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {g.phone ?? "—"}
                        </span>
                        <Badge
                          variant={
                            g.status === "claimed" ? "default" : "secondary"
                          }
                          className="text-[10px] w-fit"
                        >
                          {g.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGuest(g.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
