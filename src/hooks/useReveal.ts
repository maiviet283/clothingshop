import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect on the client, useEffect on the server (SSG) to avoid the
// "useLayoutEffect does nothing on the server" warning during pre-render.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Reveal-on-scroll. Adds `is-visible` once the element enters the viewport.
 *
 * Robustness:
 *  - Elements already in the viewport at mount are revealed *before paint*
 *    (no flash of invisible above-the-fold content).
 *  - If IntersectionObserver is unavailable, content is shown immediately.
 *  - A <noscript> rule in index.html shows all `.reveal` content when JS is off.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    // Already on screen at mount → reveal synchronously, skip the observer.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      });
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}
