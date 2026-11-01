"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/umami";

// Sends one analytics event when the page (or its `data`) shows up, e.g. "which
// members tab was opened". Use it for things a plain `data-umami-event` click
// attribute can't express, like viewing a page. Never put names, emails or
// anything typed by a person in `data`. If the analytics script is still
// loading it tries again a few times, then gives up quietly.
export function TrackEvent({
  name,
  data,
}: {
  name: string;
  data?: Record<string, string>;
}) {
  const key = JSON.stringify(data ?? {});

  useEffect(() => {
    let tries = 0;
    let timer: number | undefined;
    const send = () => {
      if (trackEvent(name, JSON.parse(key))) return;
      if (++tries <= 5) timer = window.setTimeout(send, 1000);
    };
    send();
    return () => window.clearTimeout(timer);
  }, [name, key]);

  return null;
}
