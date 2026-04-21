import type { FC } from "react";
import { ExternalLink, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import { Button } from "@/components/ui/button";

import { useRefetch } from "../../hooks/useRefetch";

interface InvitationHeaderProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const InvitationHeader: FC<InvitationHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { slug } = useAdminStore();
  const { handleRefresh, canRefresh } = useRefetch(refetch);

  const showActions = !isLoading && !isError;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-display font-semibold">Invitation</h2>
        <p className="text-sm text-muted-foreground">
          Edit your invitation content and theme. Changes preview live on the
          right.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key={showActions.toString()}>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={handleRefresh}
                disabled={!canRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              {slug && (
                <Button variant="outline" asChild>
                  <Link
                    to={`/${slug}`}
                    target="_blank"
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                  >
                    Open live page
                    <ExternalLink />
                  </Link>
                </Button>
              )}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvitationHeader;
