import type { FC } from "react";
import { Plus, Upload, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { downloadGuestTemplate } from "../utils";
import type { Guest } from "../types";
import ArraySeparator from "@/components/custom/array-separator";

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
  const canAdd = canCreate("guests");

  return (
    <AdminPageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Guests"
      description="Your full guest list and their RSVP responses."
      action={
        canAdd && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={openCreate}
              className="gap-0"
            >
              <Plus className="w-4 h-4" /> <ActionLabel>Guest</ActionLabel>
            </Button>
            {/* <Button
              size="sm"
              variant="ghost"
              onClick={downloadGuestTemplate}
            >
              <Download className="w-4 h-4" /> Template
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openImport}
            >
              <Upload className="w-4 h-4" /> Import CSV
            </Button> */}
          </>
        )
      }
    />
  );
};

export default GuestsHeader;
