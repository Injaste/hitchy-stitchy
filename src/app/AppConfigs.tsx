import { QueryClient } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppConfigs = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </QueryClientProvider>
  );
};

export default AppConfigs;
