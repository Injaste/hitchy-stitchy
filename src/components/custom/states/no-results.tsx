import type { FC } from "react";

import { Card } from "@/components/ui/card";

interface NoResultsProps {
  /** What didn't match, e.g. "No members match your search." */
  message: string;
}

/**
 * Centered muted card for an empty search/filter result. Pair with a keyed
 * `ComponentFade useBlur` inside `AnimatePresence mode="wait"` to blur-swap it
 * against the results body (see BudgetView / MembersView).
 */
const NoResults: FC<NoResultsProps> = ({ message }) => (
  <Card className="py-12 text-center text-sm text-muted-foreground">
    {message}
  </Card>
);

export default NoResults;
