"use client";

import { useEffect } from "react";

export function ScrollGridBackground() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    function updateGridPosition() {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const offset = reducedMotion.matches ? 0 : window.scrollY * 0.16;
        root.style.setProperty("--grid-near-offset", `${offset}px`);
        root.style.setProperty("--grid-far-offset", `${-offset}px`);
      });
    }

    updateGridPosition();
    window.addEventListener("scroll", updateGridPosition, { passive: true });
    reducedMotion.addEventListener("change", updateGridPosition);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateGridPosition);
      reducedMotion.removeEventListener("change", updateGridPosition);
      root.style.removeProperty("--grid-near-offset");
      root.style.removeProperty("--grid-far-offset");
    };
  }, []);

  return <div className="scroll-grid-background" aria-hidden="true" />;
}
