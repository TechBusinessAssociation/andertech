"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/umami";

// Tells analytics when a landing-page section scrolls into view, once per
// section per visit, so the dashboard shows how far down the page people get
// (the "section-view" event, grouped by its `section` value). A section counts
// as reached when any part of it enters the top 60% of the screen (not "30%
// visible", which a very tall section on a phone could never meet). Sections
// opt in with a `data-section="name"` attribute. If analytics isn't loaded
// (ad blocker, dev, previews) it does nothing.
export function SectionReach() {
  useEffect(() => {
    const seen = new Set<string>();
    const tries = new Map<string, number>();
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const name = el.dataset.section;
          if (!entry.isIntersecting || !name || seen.has(name)) continue;
          if (!trackEvent("section-view", { section: name })) {
            // The analytics script may still be loading (the hero is in view
            // at once): look again in a second, a few times at most, so an
            // ad-blocked visit doesn't keep retrying.
            const n = (tries.get(name) ?? 0) + 1;
            tries.set(name, n);
            if (n <= 5) {
              observer.unobserve(el);
              timers.push(window.setTimeout(() => observer.observe(el), 1000));
            }
            continue;
          }
          seen.add(name);
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    document
      .querySelectorAll("[data-section]")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return null;
}
