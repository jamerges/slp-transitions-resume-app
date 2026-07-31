"use client";

import { useEffect } from "react";

// Reports our height to the parent page so the iframe can resize itself —
// no inner scrollbar, no guessing a fixed height.
export default function EmbedAutoHeight() {
  useEffect(() => {
    const post = () => {
      const h = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      window.parent?.postMessage({ slpQuizHeight: h }, "*");
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    const iv = setInterval(post, 800);
    return () => {
      ro.disconnect();
      clearInterval(iv);
    };
  }, []);
  return null;
}
