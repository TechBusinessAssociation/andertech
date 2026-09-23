import Image from "next/image";
import { site } from "../../content/site";

// Single place the logo image is wired up. Every part of the site that
// shows the logo should use this component, so changing content/site.ts
// (or replacing the image file it points to) updates the logo everywhere.
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={site.logo}
      alt={site.logoAlt}
      width={692}
      height={180}
      priority
      className={className}
    />
  );
}
