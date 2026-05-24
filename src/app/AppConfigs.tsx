import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppConfigs = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          {children}
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppConfigs;
