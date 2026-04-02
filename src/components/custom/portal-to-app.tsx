import { usePortalContainer } from "@/app/AppPortals";
import { Portal } from "radix-ui";

const PortalToApp = ({ children }: { children: React.ReactNode }) => {
  const container = usePortalContainer();

  return <Portal.Root container={container}>{children}</Portal.Root>;
};

export default PortalToApp;
