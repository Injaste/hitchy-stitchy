import type { FC } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

interface ThemesHeaderProps extends BaseHeaderProps {}

const ThemesHeader: FC<ThemesHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { slug } = useAdminStore();

  return (
    <PageHeader
      description="Choose a template for your invitation page. Each template can be customised and published independently."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      // action={
      //   slug && (
      //     <Button variant="outline" asChild>
      //       <Link to={`/${slug}`} target="_blank" className="inline-flex items-center gap-1.5">
      //         Open live page
      //         <ExternalLink />
      //       </Link>
      //     </Button>
      //   )
      // }
    />
  );
};

export default ThemesHeader;
