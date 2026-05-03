import type { FC } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

interface InvitationHeaderProps extends BaseHeaderProps {}

const InvitationHeader: FC<InvitationHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { slug } = useAdminStore();

  return (
    <PageHeader
      description="Send and track invitations to your team. Pending invites will appear here until accepted."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      action={
        slug && (
          <Button variant="outline" asChild>
            <Link
              to={`/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5"
            >
              Open live page
              <ExternalLink />
            </Link>
          </Button>
        )
      }
    />
  );
};

export default InvitationHeader;
