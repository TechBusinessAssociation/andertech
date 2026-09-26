import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/resource-kind";

// A link that shows just an icon and, on hover or keyboard focus, flips over
// to reveal its label (the flip itself is CSS: `.flip` in globals.css). The
// faces are hidden from screen readers; the link's aria-label carries the name.
// On touch devices there is no hover, so a tap simply follows the link.
export function FlipButton({
  href,
  icon,
  label,
  external = false,
  variant = "ghost",
}: {
  href: string;
  icon: IconName;
  label: string;
  external?: boolean;
  variant?: "primary" | "ghost";
}) {
  const faces =
    variant === "primary"
      ? {
          front:
            "bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy",
          back: "bg-brand-blue text-white dark:bg-white dark:text-brand-navy",
        }
      : {
          front:
            "border border-brand-blue/30 bg-white/60 text-brand-navy dark:border-white/20 dark:bg-white/10 dark:text-white",
          back: "bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy",
        };

  return (
    <a
      href={href}
      aria-label={external ? `${label} (opens in a new tab)` : label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flip inline-block h-11 w-26 rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
    >
      <span className="flip-inner" aria-hidden="true">
        <span className={`flip-face flip-front rounded-[10px] ${faces.front}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span
          className={`flip-face flip-back rounded-[10px] text-sm font-semibold ${faces.back}`}
        >
          {label}
        </span>
      </span>
    </a>
  );
}
