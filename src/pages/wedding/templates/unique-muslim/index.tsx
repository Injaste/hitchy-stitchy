import { useEffect, useState } from "react";
import { useFrame } from "react-frame-component";
import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";
import EnvelopePreloader from "./EnvelopePreloader";
import PortalToApp from "@/components/custom/portal-to-app";
import type { ThemeProps } from "@/pages/wedding/templates/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Cinzel+Decorative:wght@400;700;900&display=swap";

const HEADING_STYLE = `
  .um-root h1,.um-root h2,.um-root h3,
  .um-root h4,.um-root h5,.um-root h6 {
    font-family: 'Cinzel Decorative', cursive;
  }
`;

const UniqueMuslim = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const bgImage = config?.background_image ?? "/dannad.png";
  const [ready, setReady] = useState(false);

  const { document: frameDoc } = useFrame();

  useEffect(() => {
    const doc = frameDoc ?? document;
    if (!doc?.head) return;

    const existingLink = doc.head.querySelector(`link[href="${FONT_URL}"]`);
    if (!existingLink) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      doc.head.appendChild(link);
    }

    const style = doc.createElement("style");
    style.textContent = HEADING_STYLE;
    doc.head.appendChild(style);

    return () => {
      if (!existingLink) doc.head.querySelector(`link[href="${FONT_URL}"]`)?.remove();
      style.remove();
    };
  }, [frameDoc]);

  return (
    <div className="um-root" style={{ fontFamily: "'Cinzel', serif" }}>
      <PortalToApp>
        <EnvelopePreloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />
        <img
          className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50 -z-10 blur-sm"
          src={bgImage}
          alt=""
        />
        <FloatingIcons />
      </PortalToApp>

      <Hero eventConfig={eventConfig} pageConfig={pageConfig} ready={ready} />
      <Details eventConfig={eventConfig} pageConfig={pageConfig} />
      <RSVP eventConfig={eventConfig} pageConfig={pageConfig} />
    </div>
  );
};

export default UniqueMuslim;
