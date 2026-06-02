import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Lenis } from "lenis/react";
import { useNavigate } from "react-router-dom";

import ComponentFade from "@/components/animations/animate-component-fade";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicEvent, usePublicEventRealtime } from "./queries";
import ThemeLoader from "./states/ThemeLoader";
import ThemeState from "./states/ThemeState";
import { FallbackTheme, themeRegistry } from "./templates";
import type { PublicEventConfig } from "./types";

interface WeddingProps {
  // When provided (e.g. admin preview), data is pre-composed and no fetch
  // is made. When absent, the component fetches via the public event query.
  previewConfig?: PublicEventConfig;
}

const Wedding = ({ previewConfig }: WeddingProps = {}) => {
  const isMobile = useIsMobile();
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  const isPreview = !!previewConfig;

  // Only run the query when not in preview mode.
  const {
    data: fetchedConfig,
    isLoading,
    error,
  } = usePublicEvent({ enabled: !isPreview });

  const eventConfig = previewConfig ?? fetchedConfig;

  usePublicEventRealtime(!isPreview ? (eventConfig?.event_id ?? null) : null);

  const hasError = !isPreview && !!error;
  const isNotFound = !isPreview && !isLoading && !eventConfig && !error;

  useEffect(() => {
    if (hasError || isNotFound) navigate("/", { replace: true });
  }, [hasError, isNotFound, navigate]);

  const showStateOverlay =
    !isReady || (!isPreview && (isLoading || !eventConfig || hasError));

  const themeSlug = eventConfig?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  const renderOverlayContent = () => {
    if (!showStateOverlay) return null;

    if (!isPreview && (hasError || isNotFound)) {
      return null;
    }

    if (!isPreview && isLoading) {
      return (
        <ComponentFade key="loader">
          <ThemeLoader loadedCompleted={() => setIsReady(true)} />
        </ComponentFade>
      );
    }

    if (!isReady) {
      return (
        <ComponentFade key="loader">
          <ThemeLoader loadedCompleted={() => setIsReady(true)} />
        </ComponentFade>
      );
    }

    return null;
  };

  const content = (
    <>
      {eventConfig && !hasError && (
        <ThemeComponent
          eventConfig={eventConfig}
          pageConfig={eventConfig.published_page?.config ?? {}}
          loaderReady={isReady}
        />
      )}

      <AnimatePresence mode="wait">
        {showStateOverlay && (
          <ThemeState key="state-overlay">
            <AnimatePresence mode="wait">
              {renderOverlayContent()}
            </AnimatePresence>
          </ThemeState>
        )}
      </AnimatePresence>
    </>
  );

  // Skip Lenis in preview — the iframe has its own scroll context.
  if (isPreview || isMobile) return content;

  return (
    <Lenis
      root
      options={{
        prevent: () => document.body.hasAttribute("data-scroll-locked"),
      }}
    >
      <main className="max-w-md mx-auto">{content}</main>
    </Lenis>
  );
};

export default Wedding;
