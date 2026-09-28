import { getRecruitingPage } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { saveRecruitingPageAction } from "./actions";
import {
  Notice,
  PageHeader,
  cardClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
} from "../ui";

type Props = {
  searchParams: Promise<{ notice?: string }>;
};

// The one thing that isn't a category/resource: the embedded Looker Studio
// dashboard pinned above Recruiting resources' categories on /members. Every
// other link on that tab (reporting survey, invite/offer, toolkit links like
// Resume bot / Cover letter / Question bank / Playbooks) is a normal
// category + resource -- add those on /admin/categories and /admin/resources
// with section set to "Recruiting resources".
export default async function AdminRecruitingPage({ searchParams }: Props) {
  await requireAdmin();

  const { notice } = await searchParams;
  const page = await getRecruitingPage();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recruiting dashboard"
        description="The dashboard embedded at the top of the Recruiting resources tab on /members. Everything else on that tab (links, toolkit items) is a category on /admin/categories with its section set to Recruiting resources."
      />

      {notice === "saved" && <Notice message="Saved." />}

      <form action={saveRecruitingPageAction} className={`${cardClass} gap-4`}>
        <label className={fieldLabelClass}>
          Recruiting dashboard (Looker Studio embed URL)
          <input
            name="dashboardUrl"
            type="url"
            defaultValue={page.dashboardUrl ?? ""}
            placeholder="https://..."
            className={`${inputClass} font-normal`}
          />
        </label>
        <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Use Looker Studio&apos;s own &quot;Embed report&quot; link, not the
          regular share link. Leave blank to hide the dashboard block
          entirely. The dashboard&apos;s real access control stays Looker
          Studio&apos;s own sharing list -- this only decides whether it
          shows on the page.
        </p>

        <button type="submit" className={`${primaryButtonClass} mt-1`}>
          Save
        </button>
      </form>
    </div>
  );
}
