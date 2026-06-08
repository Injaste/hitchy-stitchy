import type { FC, ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  /** The circle, tile, or logo shown above the title. Caller builds it. */
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Create button(s). Omit to hide — gate this at the call site. */
  action?: ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <Card className="border-dashed bg-muted/20 ring-0 shadow-none">
    <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5">{icon}</div>
      <h3 className="mb-1.5 font-display text-lg font-medium text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      )}
    </CardContent>
  </Card>
);

export default EmptyState;
