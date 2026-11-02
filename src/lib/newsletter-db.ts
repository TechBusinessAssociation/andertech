import { sql } from "@vercel/postgres";
import type { IssueInput } from "@/lib/newsletter";

// Newsletter issues, ranked items and tags in Vercel Postgres (see schema.sql).
// The public reads fail closed like the rest of members-db.ts: a DB error shows
// an empty page. The admin functions below do no authorization themselves --
// every caller has passed requireNewsletterAdmin().
//
// Editor's take is the locked part. It is only ever selected when the caller
// says the visitor is an approved member, so for everyone else the text never
// leaves the database -- the page can't leak what it never received. `hasTake`
// still tells the page whether to draw a lock. author_name is never returned by
// the public reads: it is backend-only for now.
//
// Lists of ids and names go to SQL as one comma-separated string (split back
// with string_to_array), the same way members-db.ts passes roles.

const csv = (values: readonly (string | number)[]) => values.join(",");

// ---------- Public ----------

export type PublicIssue = {
  id: number;
  title: string;
  publishedOn: string;
  intro: string;
  closing: string;
};

export type NewsletterItem = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  imageUrl: string | null;
  imageAlt: string;
  hasTake: boolean;
  editorsTake: string | null; // null unless `includeTake`
};

// Published issues, newest first.
export async function getPublishedIssues(): Promise<PublicIssue[]> {
  try {
    const { rows } = await sql`
      select id, title, intro, closing,
             to_char(published_on, 'YYYY-MM-DD') as published_on
      from newsletter_issues
      where published
      order by published_on desc, id desc
    `;
    return rows.map((row) => ({
      id: Number(row.id),
      title: row.title as string,
      publishedOn: row.published_on as string,
      intro: row.intro as string,
      closing: row.closing as string,
    }));
  } catch {
    return [];
  }
}

// One published issue's items, in the order the editor ranked them.
export async function getIssueItems(
  issueId: number,
  includeTake: boolean,
): Promise<NewsletterItem[]> {
  try {
    const { rows } = await sql`
      select i.id, i.title, i.body, i.image_url, i.image_alt,
             i.editors_take <> '' as has_take,
             case when ${includeTake} then i.editors_take else null end
               as editors_take,
             coalesce(
               array_agg(t.name order by lower(t.name))
                 filter (where t.id is not null),
               '{}'
             ) as tags
      from newsletter_items i
      join newsletter_issues n on n.id = i.issue_id and n.published
      left join newsletter_item_tags it on it.item_id = i.id
      left join newsletter_tags t on t.id = it.tag_id
      where i.issue_id = ${issueId}
      group by i.id
      order by i.position, i.id
    `;
    return rows.map((row) => ({
      id: Number(row.id),
      title: row.title as string,
      body: row.body as string,
      tags: row.tags as string[],
      imageUrl: (row.image_url as string | null) ?? null,
      imageAlt: row.image_alt as string,
      hasTake: row.has_take as boolean,
      editorsTake: (row.editors_take as string | null) ?? null,
    }));
  } catch {
    return [];
  }
}

// ---------- Admin: issues ----------

export type AdminIssue = {
  id: number;
  title: string;
  publishedOn: string;
  published: boolean;
  intro: string;
  closing: string;
  itemCount: number;
};

export async function getAdminIssues(): Promise<AdminIssue[]> {
  const { rows } = await sql`
    select n.id, n.title, n.published, n.intro, n.closing,
           to_char(n.published_on, 'YYYY-MM-DD') as published_on,
           count(i.id) as item_count
    from newsletter_issues n
    left join newsletter_items i on i.issue_id = n.id
    group by n.id
    order by n.published_on desc, n.id desc
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    title: row.title as string,
    published: row.published as boolean,
    publishedOn: row.published_on as string,
    intro: row.intro as string,
    closing: row.closing as string,
    itemCount: Number(row.item_count),
  }));
}

export async function getAdminIssue(id: number): Promise<AdminIssue | null> {
  return (await getAdminIssues()).find((issue) => issue.id === id) ?? null;
}

export async function addIssue(input: IssueInput): Promise<number> {
  const { rows } = await sql`
    insert into newsletter_issues (title, published_on, intro, closing)
    values (${input.title}, ${input.publishedOn}, ${input.intro},
            ${input.closing})
    returning id
  `;
  return Number(rows[0].id);
}

export async function updateIssue(
  id: number,
  input: IssueInput,
): Promise<void> {
  await sql`
    update newsletter_issues
    set title = ${input.title}, published_on = ${input.publishedOn},
        intro = ${input.intro}, closing = ${input.closing}
    where id = ${id}
  `;
}

export async function setIssuePublished(
  id: number,
  published: boolean,
): Promise<void> {
  await sql`
    update newsletter_issues set published = ${published} where id = ${id}
  `;
}

// Image URLs of an issue's items, so the caller can delete the files from Blob
// before the rows go (deleting the issue deletes its items with it).
export async function getIssueImageUrls(id: number): Promise<string[]> {
  const { rows } = await sql`
    select image_url from newsletter_items
    where issue_id = ${id} and image_url is not null
  `;
  return rows.map((row) => row.image_url as string);
}

export async function removeIssue(id: number): Promise<void> {
  await sql`delete from newsletter_issues where id = ${id}`;
}

// ---------- Admin: items ----------

export type AdminItem = {
  id: number;
  position: number;
  title: string;
  body: string;
  editorsTake: string;
  imageUrl: string | null;
  imageAlt: string;
  authorName: string;
  tagIds: number[];
};

export async function getAdminItems(issueId: number): Promise<AdminItem[]> {
  const { rows } = await sql`
    select i.id, i.position, i.title, i.body, i.editors_take, i.image_url,
           i.image_alt, i.author_name,
           coalesce(
             array_agg(it.tag_id) filter (where it.tag_id is not null),
             '{}'
           ) as tag_ids
    from newsletter_items i
    left join newsletter_item_tags it on it.item_id = i.id
    where i.issue_id = ${issueId}
    group by i.id
    order by i.position, i.id
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    position: Number(row.position),
    title: row.title as string,
    body: row.body as string,
    editorsTake: row.editors_take as string,
    imageUrl: (row.image_url as string | null) ?? null,
    imageAlt: row.image_alt as string,
    authorName: row.author_name as string,
    tagIds: (row.tag_ids as (string | number)[]).map(Number),
  }));
}

// Names used before, for the author field's suggestions.
export async function getNewsletterAuthors(): Promise<string[]> {
  const { rows } = await sql`
    select author_name from newsletter_items
    where author_name <> ''
    group by author_name
    order by max(created_at) desc
  `;
  return rows.map((row) => row.author_name as string);
}

export async function getItemImageUrl(id: number): Promise<string | null> {
  const { rows } = await sql`
    select image_url from newsletter_items where id = ${id}
  `;
  return (rows[0]?.image_url as string | null) ?? null;
}

type ItemFields = {
  title: string;
  body: string;
  editorsTake: string;
  imageUrl: string | null;
  imageAlt: string;
  authorName: string;
};

// A new item goes to the bottom of its issue.
export async function addItem(
  issueId: number,
  f: ItemFields,
): Promise<number> {
  const { rows } = await sql`
    insert into newsletter_items
      (issue_id, position, title, body, editors_take, image_url, image_alt,
       author_name)
    values
      (${issueId},
       (select coalesce(max(position), 0) + 1 from newsletter_items
        where issue_id = ${issueId}),
       ${f.title}, ${f.body}, ${f.editorsTake}, ${f.imageUrl}, ${f.imageAlt},
       ${f.authorName})
    returning id
  `;
  return Number(rows[0].id);
}

// Scoped to the issue so a forged item id from another issue changes nothing.
export async function updateItem(
  issueId: number,
  id: number,
  f: ItemFields,
): Promise<boolean> {
  const { rowCount } = await sql`
    update newsletter_items
    set title = ${f.title}, body = ${f.body}, editors_take = ${f.editorsTake},
        image_url = ${f.imageUrl}, image_alt = ${f.imageAlt},
        author_name = ${f.authorName}
    where id = ${id} and issue_id = ${issueId}
  `;
  return (rowCount ?? 0) > 0;
}

export async function removeItem(issueId: number, id: number): Promise<void> {
  await sql`
    delete from newsletter_items where id = ${id} and issue_id = ${issueId}
  `;
}

// Sets an item's tags to exactly: the chosen existing tags plus the typed new
// names, creating any new names first -- in one statement. A new name that
// matches an existing tag (any capitalisation) reuses it instead.
export async function setItemTags(
  itemId: number,
  tagIds: readonly number[],
  newNames: readonly string[],
): Promise<void> {
  await sql`
    with created as (
      insert into newsletter_tags (name)
      select n from unnest(string_to_array(${csv(newNames)}::text, ',')) as n
      where n <> ''
      on conflict ((lower(name))) do nothing
      returning id
    ),
    wanted as (
      select id from created
      union
      select id from newsletter_tags
      where lower(name) = any(string_to_array(lower(${csv(newNames)}::text), ','))
      union
      select id from newsletter_tags
      where id = any(string_to_array(${csv(tagIds)}::text, ',')::bigint[])
    ),
    cleared as (
      delete from newsletter_item_tags
      where item_id = ${itemId} and tag_id not in (select id from wanted)
    )
    insert into newsletter_item_tags (item_id, tag_id)
    select ${itemId}, id from wanted
    on conflict do nothing
  `;
}

// Moves an item one place up or down within its issue by rewriting every
// position 1..n from the new order (so positions never collide or gap).
export async function moveItem(
  issueId: number,
  id: number,
  direction: "up" | "down",
): Promise<void> {
  const { rows } = await sql`
    select id from newsletter_items
    where issue_id = ${issueId}
    order by position, id
  `;
  const ids = rows.map((row) => Number(row.id));
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];

  await sql`
    update newsletter_items i
    set position = o.pos
    from unnest(string_to_array(${csv(ids)}::text, ',')::bigint[])
         with ordinality as o(item_id, pos)
    where i.id = o.item_id and i.issue_id = ${issueId}
  `;
}

// ---------- Admin: tags ----------

export type AdminTag = { id: number; name: string; itemCount: number };

export async function getTags(): Promise<AdminTag[]> {
  const { rows } = await sql`
    select t.id, t.name, count(it.item_id) as item_count
    from newsletter_tags t
    left join newsletter_item_tags it on it.tag_id = t.id
    group by t.id
    order by lower(t.name)
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name as string,
    itemCount: Number(row.item_count),
  }));
}

export async function addTags(names: readonly string[]): Promise<void> {
  await sql`
    insert into newsletter_tags (name)
    select n from unnest(string_to_array(${csv(names)}::text, ',')) as n
    where n <> ''
    on conflict ((lower(name))) do nothing
  `;
}

export async function removeTag(id: number): Promise<void> {
  await sql`delete from newsletter_tags where id = ${id}`;
}
