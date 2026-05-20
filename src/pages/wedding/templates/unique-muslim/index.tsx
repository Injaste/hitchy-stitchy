import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";
import PortalToApp from "@/components/custom/portal-to-app";
import type { ThemeProps } from "@/pages/wedding/templates/types";

const UniqueMuslim = ({ eventConfig, pageConfig }: ThemeProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const bgImage = config?.background_image ?? "/dannad.png";

  return (
    <div className="font-medium">
      <PortalToApp>
        <img
          className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50 -z-10 blur-sm"
          src={bgImage}
          alt=""
        />
        <FloatingIcons />
      </PortalToApp>

      <Hero eventConfig={eventConfig} pageConfig={pageConfig} />
      <Details eventConfig={eventConfig} pageConfig={pageConfig} />
      <RSVP eventConfig={eventConfig} pageConfig={pageConfig} />
    </div>
  );
};

export default UniqueMuslim;
