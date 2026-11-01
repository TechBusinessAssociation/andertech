import { Analytics } from "@/components/analytics";

// Every /members page counts anonymous usage (page views, tab and resource
// clicks) with the same cookie-free Umami script as the public pages. /admin
// is not tracked. See src/components/analytics.tsx and the README.
export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Analytics />
      {children}
    </>
  );
}
