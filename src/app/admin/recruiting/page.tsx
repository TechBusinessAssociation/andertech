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

// One settings row (see schema.sql's comment on recruiting_page) behind the
// Recruiting resources tab on /members: the embedded dashboard, the
// reporting survey, one invite/offer survey link, and four named toolkit
// links. Every field is optional -- the tab just hides whatever is blank.
export default async function AdminRecruitingPage({ searchParams }: Props) {
  await requireAdmin();

  const { notice } = await searchParams;
  const page = await getRecruitingPage();

  const field = (name: keyof typeof page, label: string, placeholder = "https://...") => (
    <label className={fieldLabelClass}>
      {label}
      <input
        name={name}
        type="url"
        defaultValue={page[name] ?? ""}
        placeholder={placeholder}
        className={`${inputClass} font-normal`}
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recruiting tab"
        description="Links shown on the Recruiting resources tab on /members. Leave a field blank to hide that block."
      />

      {notice === "saved" && <Notice message="Saved." />}

      <form action={saveRecruitingPageAction} className={`${cardClass} gap-4`}>
        {field(
          "dashboardUrl",
          "Recruiting dashboard (Looker Studio embed URL)",
        )}
        <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Use Looker Studio&apos;s own &quot;Embed report&quot; link, not the
          regular share link. The dashboard&apos;s real access control stays
          Looker Studio&apos;s own sharing list -- this only decides whether
          it shows on the page.
        </p>

        {field("reportingUrl", "Reporting survey")}
        {field("inviteOfferUrl", "Invite / offer survey")}

        <div className="mt-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="mb-3 text-sm font-semibold">Toolkit links</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("resumeBotUrl", "Resume bot")}
            {field("coverLetterUrl", "Cover letter")}
            {field("questionBankUrl", "Question bank")}
            {field("playbooksUrl", "Playbooks")}
          </div>
        </div>

        <button type="submit" className={`${primaryButtonClass} mt-2`}>
          Save
        </button>
      </form>
    </div>
  );
}
