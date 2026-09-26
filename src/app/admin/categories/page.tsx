import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { removeCategoryAction, saveCategoryAction } from "./actions";
import {
  Notice,
  PageHeader,
  cardClass,
  dangerButtonClass,
  fieldLabelClass,
  inputClass,
  linkClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  theadClass,
  thClass,
  trClass,
} from "../ui";

type Props = {
  searchParams: Promise<{ edit?: string; notice?: string }>;
};

const NOTICES: Record<string, string> = {
  "in-use":
    "That category still has resources in it. Move or remove them first.",
  "name-required": "A category needs a name.",
};

export default async function AdminCategoriesPage({ searchParams }: Props) {
  await requireAdmin();

  const { edit, notice } = await searchParams;
  const categories = await getCategoriesWithCounts();
  // Postgres returns bigserial ids as strings, hence Number().
  const editing = edit
    ? categories.find((category) => Number(category.id) === Number(edit))
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="The groups resources are listed under on the members page. Lowest order number shows first; leave gaps (10, 20, 30) so a new one can slot in between."
      />

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      <section className={cardClass} aria-labelledby="category-form">
        <h2 id="category-form" className="font-semibold">
          {editing ? `Edit: ${editing.name}` : "Add category"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveCategoryAction}
          className="flex flex-col gap-3"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={`${fieldLabelClass} sm:w-48`}>
              Name
              <input
                name="name"
                required
                defaultValue={editing?.name}
                className={`${inputClass} font-normal`}
              />
            </label>
            <label className={`${fieldLabelClass} sm:flex-1`}>
              Description (optional)
              <input
                name="description"
                defaultValue={editing?.description ?? ""}
                className={`${inputClass} font-normal`}
              />
            </label>
            <label className={`${fieldLabelClass} sm:w-24`}>
              Order
              <input
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 50}
                className={`${inputClass} font-normal`}
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryButtonClass}>
              {editing ? "Save changes" : "Add category"}
            </button>
            {editing && (
              <Link href="/admin/categories" className={secondaryButtonClass}>
                Cancel
              </Link>
            )}
          </div>
        </form>
      </section>

      <div className={tableWrapClass}>
        <table className={`${tableClass} min-w-[32rem]`}>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>
                Name
              </th>
              <th scope="col" className={thClass}>
                Description
              </th>
              <th scope="col" className={thClass}>
                Order
              </th>
              <th scope="col" className={thClass}>
                Resources
              </th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={5} className={`${tdClass} text-zinc-600`}>
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className={trClass}>
                  <td className={`${tdClass} font-medium`}>{category.name}</td>
                  <td className={`${tdClass} text-zinc-600 dark:text-zinc-400`}>
                    {category.description ?? ""}
                  </td>
                  <td className={tdClass}>{category.sort_order}</td>
                  <td className={tdClass}>{category.resource_count}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/categories?edit=${category.id}#category-form`}
                        className={`${linkClass} text-sm`}
                      >
                        Edit
                      </Link>
                      <form action={removeCategoryAction}>
                        <input type="hidden" name="id" value={category.id} />
                        <button type="submit" className={dangerButtonClass}>
                          Remove
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
