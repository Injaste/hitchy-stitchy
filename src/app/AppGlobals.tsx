import { Toaster } from "@/components/ui/sonner";
import PwaReloadPrompt from "@/components/pwa-reload-prompt";

const AppGlobals = () => {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <PwaReloadPrompt />
      {/* custom portals go here */}
    </>
  );
};

export default AppGlobals;
