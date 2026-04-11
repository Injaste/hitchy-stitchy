import type { FC } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const ErrorState: FC<ErrorStateProps> = ({
  message = "Something went wrong.",
  onRetry,
  isRetrying = false,
}) => {
  return (
    <Card className="border-dashed border-destructive/40">
      <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-9 h-9 text-destructive" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
          {message}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Retrying…" : "Try again"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorState;
