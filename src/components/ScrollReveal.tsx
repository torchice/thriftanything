'use client';

import { useEffect } from 'react';

/*
  Reveals [data-reveal] blocks once as they enter the viewport.

  Purpose (R-19): the page is one long shelf, and a block arriving under its own
  weight marks where one part ends and the next begins. Each block fires once and
  is then unobserved, so nothing loops.

  The hidden state lives in CSS behind data-reveal-ready (set before paint in layout)
  and behind prefers-reduced-motion: no-preference. Without JS, or with reduced motion,
  every block renders visible and this component does nothing.

  A MutationObserver picks up blocks that arrive after hydration, which is how the
  catalog grid reaches the page through its Suspense boundary.
*/
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute('data-reveal-ready')) return;

    const revealNow = (el: Element) => el.classList.add('is-revealed');

    if (!('IntersectionObserver' in window) || !('MutationObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(revealNow);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealNow(entry.target);
          io.unobserve(entry.target);
        }
      },
      // Start slightly before the block reaches the fold so a fast scroll does not pop.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    const observe = (scope: ParentNode) => {
      scope
        .querySelectorAll('[data-reveal]:not(.is-revealed)')
        .forEach((el) => io.observe(el));
    };

    observe(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches('[data-reveal]')) io.observe(node);
          observe(node);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
