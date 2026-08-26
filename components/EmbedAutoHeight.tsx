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
      const h = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
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
