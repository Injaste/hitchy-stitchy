import React, { useLayoutEffect, useState, useRef } from "react";
import * as Portal from "@radix-ui/react-portal";

const PortalToApp = ({ children }: { children: React.ReactNode }) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const scoutRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!scoutRef.current) return;

    // 1. Get the local document (handles Iframe isolation)
    const doc = scoutRef.current.ownerDocument;

    // 2. Find the closest body or specific container
    // This ensures we stay inside the iframe if the scout is in an iframe
    const container = doc.getElementById("app-portal") || doc.body;

    setTarget(container);
  }, []);

  return (
    <>
      {/* This sits in the DOM exactly where you call <PortalToApp /> */}
      <div ref={scoutRef} style={{ display: "none" }} />

      {target && <Portal.Root container={target}>{children}</Portal.Root>}
    </>
  );
};

export default PortalToApp;
