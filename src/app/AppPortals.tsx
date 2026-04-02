import { createContext, useContext, useRef } from "react";

const PortalContext = createContext<HTMLDivElement | null>(null);

export const usePortalContainer = () => useContext(PortalContext);

const AppPortals = ({ children }: { children?: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <PortalContext.Provider value={ref.current}>
      {children}
      <div ref={ref} id="app-portal" />
    </PortalContext.Provider>
  );
};

export default AppPortals;
