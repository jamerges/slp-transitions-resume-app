"use client";

import { useEffect } from "react";

/**
 * Reports our height to the parent page so the iframe can resize itself —
 * no inner scrollbar, no guessing a fixed height.
 *
 * Each embed uses its own message key so a page carrying two of them can tell
 * the messages apart. Changing a key means editing the listener in the
 * matching WordPress snippet under content/, so don't rename them casually.
 */
export default function EmbedAutoHeight({ messageKey }: { messageKey: string }) {
  useEffect(() => {
    const post = () => {
      // Measure the body only. documentElement.scrollHeight is floored at the
      // viewport height, and inside an iframe the viewport IS the iframe — so
      // including it makes the reported height whatever the frame already is.
      // The frame can then grow but never shrink, and sits at its fallback
      // height forever. Both of these are content-driven (html and body carry
      // no height rules in globals.css), so neither has that floor.
      const h = Math.ceil(
        Math.max(
          document.body.getBoundingClientRect().height,
          document.body.scrollHeight
        )
      );
      window.parent?.postMessage({ [messageKey]: h }, "*");
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    const iv = setInterval(post, 800);
    return () => {
      ro.disconnect();
      clearInterval(iv);
    };
  }, [messageKey]);
  return null;
}
