import type { FC } from "react";
import { Plus, Upload, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { downloadGuestTemplate } from "../utils";
import type { Guest } from "../types";

interface GuestsHeaderProps extends BaseHeaderProps {
  data?: Guest[];
}

const GuestsHeader: FC<GuestsHeaderProps> = ({
  data,
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess();
  const openCreate = useGuestModalStore((s) => s.openCreate);
  const openImport = useGuestModalStore((s) => s.openImport);
  const total = data?.length ?? 0;
  const confirmed = data?.filter((g) => g.status === "confirmed").length ?? 0;
  const canAdd = canCreate("rsvp");

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      description="Your full guest list and their RSVP responses. See who's coming, who's pending, and who's declined."
      meta={
        total > 0 && (
          <span>
            {total} {total === 1 ? "guest" : "guests"}
            {confirmed > 0 && (
              <>
                <span className="mx-1.5">·</span>
                {confirmed} confirmed
              </>
            )}
          </span>
        )
      }
      action={
        canAdd && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={openCreate}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add guest
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-2"
              onClick={downloadGuestTemplate}
            >
              <Download className="w-4 h-4" /> Template
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openImport}
              className="gap-2"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </Button>
          </>
        )
      }
    />
  );
};

export default GuestsHeader;
