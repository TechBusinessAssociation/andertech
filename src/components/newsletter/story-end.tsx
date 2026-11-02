"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/umami";

// An invisible marker placed at the end of each newsletter story. When it
// scrolls into view the reader has got to the end of that story, so it sends
// one "newsletter-story-end" event (once per story per visit) with the issue
// date and the story's number. In Umami, count the events by `story` to see
// where readers stop. Only the public /newsletter page renders it; the admin
// preview does not, and nothing about the reader is sent. If analytics isn't
// loaded (ad blocker, dev, previews) it does nothing; if the script is still
// loading it looks again in a second, a few times at most.
export function StoryEnd({ issue, story }: { issue: string; story: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let tries = 0;
    let timer: number | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const send = () => {
        if (
          trackEvent("newsletter-story-end", { issue, story: String(story) })
        )
          return;
        if (++tries <= 5) timer = window.setTimeout(send, 1000);
      };
      send();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [issue, story]);

  return <div ref={ref} aria-hidden="true" />;
}
