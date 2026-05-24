import { useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Lenis } from "lenis/react";

import ComponentFade from "@/components/animations/animate-component-fade";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDocumentMeta } from "@/hooks/use-document-meta";

import { usePublicEvent, usePublicEventRealtime } from "./queries";
import ThemeError from "./states/ThemeError";
import ThemeLoader from "./states/ThemeLoader";
import ThemeState from "./states/ThemeState";
import { FallbackTheme, themeRegistry } from "./templates";
import type { PublicEventConfig } from "./types";

interface WeddingProps {
  // When provided (e.g. admin preview), data is pre-composed and no fetch
  // is made. When absent, the component fetches via the public event query.
  previewConfig?: PublicEventConfig;
}

const DEFAULT_DESCRIPTION =
  "We invite you to witness the beginning of our forever. A day where two souls become one, guided by faith and bounded by love.";

const Wedding = ({ previewConfig }: WeddingProps = {}) => {
  const isMobile = useIsMobile();
  const { slug } = useParams<{ slug: string }>();
  const [isReady, setIsReady] = useState(false);

  const isPreview = !!previewConfig;

  // Only run the query when not in preview mode.
  const {
    data: fetchedConfig,
    isLoading,
    error,
  } = usePublicEvent({ enabled: !isPreview });

  const eventConfig = previewConfig ?? fetchedConfig;

  usePublicEventRealtime(!isPreview ? (eventConfig?.event_id ?? null) : null);

  const pageConfig = eventConfig?.published_page?.config;
  const muslim = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;

  const groom = muslim?.groom_name?.trim();
  const bride = muslim?.bride_name?.trim();
  const composedTitle =
    groom && bride ? `The Wedding of ${groom} & ${bride}` : "You're Invited";

  useDocumentMeta({
    title: muslim?.page_title?.trim() || composedTitle,
    description: muslim?.page_description?.trim() || DEFAULT_DESCRIPTION,
    image: muslim?.og_image?.trim() || muslim?.background_image?.trim() || null,
    url: !isPreview && slug ? `https://${import.meta.env.VITE_BASE_URL}/${slug}` : null,
  });

  const hasError = !isPreview && !!error;
  const showStateOverlay =
    !isReady || (!isPreview && (isLoading || !eventConfig || hasError));

  const themeSlug = eventConfig?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  const renderOverlayContent = () => {
    if (!showStateOverlay) return null;

    if (!isPreview && (hasError || (!isLoading && !eventConfig))) {
      return (
        <ComponentFade key="error">
          <ThemeError />
        </ComponentFade>
      );
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
