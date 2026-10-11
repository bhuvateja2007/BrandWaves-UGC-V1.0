import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Global Scroll Restoration Component
 * 
 * Ensures every internal route navigation starts at the top of the destination page,
 * preventing unexpected footer-jump behavior while honoring hash anchors and 
 * preserving browser back/forward history navigation.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType(); // 'POP', 'PUSH', 'REPLACE'

  useEffect(() => {
    // 1. If a URL fragment / hash anchor is specified (e.g., #reviews or #brief),
    // scroll to the targeted element.
    if (hash) {
      const elementId = hash.replace(/^#/, '');
      const targetElement = document.getElementById(elementId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // Retry once after DOM paint if target element was rendered asynchronously
      const timeoutId = setTimeout(() => {
        const retryElement = document.getElementById(elementId);
        if (retryElement) {
          retryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    // 2. For standard PUSH / REPLACE navigation, reset window scroll position immediately
    // to top (0, 0). For POP navigation (browser Back/Forward), avoid jarring resets unless
    // at bottom.
    if (navigationType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });

      // Also reset any nested scrollable containers if present
      const mainContainers = document.querySelectorAll('main, [data-scroll-container]');
      mainContainers.forEach((container) => {
        if (container.scrollTop > 0) {
          container.scrollTop = 0;
        }
      });
    }
  }, [pathname, search, hash, navigationType]);

  return null;
};
