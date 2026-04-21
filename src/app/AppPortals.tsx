import { createContext, useContext, useState, useCallback } from "react";

const PortalContext = createContext<HTMLDivElement | null>(null);

export const usePortalContainer = () => useContext(PortalContext);

const AppPortals = ({ children }: { children?: React.ReactNode }) => {
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);

  const onRefChange = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setPortalNode(node);
    }
  }, []);

  return (
    <PortalContext.Provider value={portalNode}>
      {children}
      <div ref={onRefChange} id="app-portal" />
    </PortalContext.Provider>
  );
};

export default AppPortals;
