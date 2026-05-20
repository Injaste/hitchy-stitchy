import { AnimatePresence } from "framer-motion";
import { Lenis } from "lenis/react";

import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicEvent, usePublicEventRealtime } from "./queries";
import { themeRegistry, FallbackTheme } from "./templates";
import ThemeLoader from "./states/ThemeLoader";
import { useState } from "react";
import ComponentFade from "@/components/animations/animate-component-fade";
import ThemeError from "./states/ThemeError";
import ThemeState from "./states/ThemeState";

const Wedding = () => {
  const isMobile = useIsMobile();
  const [isReady, setIsReady] = useState(false);
  const { data: eventConfig, isLoading, error } = usePublicEvent();

  usePublicEventRealtime(eventConfig?.event_id ?? null);

  const hasError = !!error;
  const showStateWrapper = !isReady || isLoading || !eventConfig || hasError;

  const themeSlug = eventConfig?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  const content = (
    <AnimatePresence mode="wait">
      {showStateWrapper ? (
        <ComponentFade key="state-overlay">
          <ThemeState>
            <AnimatePresence mode="wait">
              {!isReady ? (
                <ComponentFade key="loader">
                  <ThemeLoader loadedCompleted={() => setIsReady(true)} />
                </ComponentFade>
              ) : (
                <ComponentFade key="error">
                  <ThemeError />
                </ComponentFade>
              )}
            </AnimatePresence>
          </ThemeState>
        </ComponentFade>
      ) : (
        <ComponentFade key="theme-content">
          <ThemeComponent
            eventConfig={eventConfig}
            pageConfig={eventConfig.published_page?.config ?? {}}
          />
        </ComponentFade>
      )}
    </AnimatePresence>
  );

  if (isMobile) return content;

  return (
    <Lenis
      root
      options={{
        prevent: () => document.body.hasAttribute("data-scroll-locked"),
      }}
    >
      {content}
    </Lenis>
  );
};

export default Wedding;
