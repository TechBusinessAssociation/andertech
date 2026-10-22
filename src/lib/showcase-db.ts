import { sql } from "@vercel/postgres";
import { MAX_PROJECTS_PER_MEMBER, type ProjectInput } from "@/lib/showcase";

// Member showcase projects in Vercel Postgres (see schema.sql). Reads fail
// closed like the rest of members-db.ts (a DB error shows an empty list). Every
// write is scoped to the signed-in member's own email inside the SQL itself, so
// a forged project id can never touch someone else's row.

export type ShowcaseProject = {
  id: number;
  title: string;
  url: string;
  description: string;
  // Name fallback chain matches the Member Directory: display name, then the
  // saved Google name, then only the email's local part -- never the address.
  authorName: string;
};

export async function getShowcaseProjects(): Promise<ShowcaseProject[]> {
  try {
    const { rows } = await sql`
      select p.id, p.title, p.url, p.description,
             coalesce(
               nullif(m.display_name, ''),
               nullif(m.google_name, ''),
               split_part(m.email, '@', 1)
             ) as author_name
      from showcase_projects p
      join members m on m.id = p.member_id
      order by p.created_at desc, p.id desc
    `;
    return rows.map((row) => ({
      id: Number(row.id),
      title: row.title as string,
      url: row.url as string,
      description: row.description as string,
      authorName: row.author_name as string,
    }));
  } catch {
    return [];
  }
}

export type MyProject = Omit<ShowcaseProject, "authorName">;

export async function getMyProjects(email: string): Promise<MyProject[]> {
  const normalized = email.trim().toLowerCase();
  try {
    const { rows } = await sql`
      select p.id, p.title, p.url, p.description
      from showcase_projects p
      join members m on m.id = p.member_id
      where m.email = ${normalized}
      order by p.created_at desc, p.id desc
    `;
    return rows.map((row) => ({
      id: Number(row.id),
      title: row.title as string,
      url: row.url as string,
      description: row.description as string,
    }));
  } catch {
    return [];
  }
}

// Returns false when the member is already at the cap (or isn't a member).
// The count check and the insert are one statement, so two quick submits
// can't both slip under the cap.
export async function addProject(
  email: string,
  input: ProjectInput,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const { rows } = await sql`
    insert into showcase_projects (member_id, title, url, description)
    select m.id, ${input.title}, ${input.url}, ${input.description}
    from members m
    where m.email = ${normalized}
      and (select count(*) from showcase_projects p where p.member_id = m.id)
          < ${MAX_PROJECTS_PER_MEMBER}
    returning id
  `;
  return rows.length > 0;
}

// Returns false when the project doesn't exist or isn't this member's.
export async function updateProject(
  email: string,
  id: number,
  input: ProjectInput,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const { rows } = await sql`
    update showcase_projects p
    set title = ${input.title}, url = ${input.url}, description = ${input.description}
    from members m
    where p.id = ${id} and p.member_id = m.id and m.email = ${normalized}
    returning p.id
  `;
  return rows.length > 0;
}

export async function removeProject(email: string, id: number): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sql`
    delete from showcase_projects p
    using members m
    where p.id = ${id} and p.member_id = m.id and m.email = ${normalized}
  `;
}
