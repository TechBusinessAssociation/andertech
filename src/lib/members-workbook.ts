import { ConfidentialClientApplication } from "@azure/msal-node";

// Reads the club's membership Excel workbook (on OneDrive for Business /
// SharePoint, via Microsoft Graph, app-only -- no signed-in Microsoft user
// involved). See CLAUDE.md's "Auth" section for the required env vars and
// how the board edits the workbook itself.
//
// Two-tier cache, by design (not just for performance):
// - A confirmed "yes, this email is a member" result is trusted for 24h,
//   so most requests never hit Graph at all.
// - Everything else (not found, or never checked) falls through to the
//   member list itself, which Next.js's fetch cache keeps at most 60s
//   stale -- so a newly-added member is approved within a minute, while a
//   removed member's access lapses within 24h at worst.
// Fails closed everywhere: missing config or a Graph error means "not a
// member" / "no resources", never a thrown error that could crash a page.

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
const LIST_REVALIDATE_SECONDS = 60;
const POSITIVE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getMsalApp(): ConfidentialClientApplication | null {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) return null;

  return new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  });
}

// Created once per warm serverless instance -- MSAL caches the acquired
// token internally, so repeated calls reuse it until it's close to expiry.
const msalApp = getMsalApp();

async function getAccessToken(): Promise<string | null> {
  if (!msalApp) return null;
  try {
    const result = await msalApp.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });
    return result?.accessToken ?? null;
  } catch {
    return null;
  }
}

type GraphTableRow = { values: unknown[][] };
type GraphTableRowsResponse = { value?: GraphTableRow[] };

// Reads every row of a named Excel Table on a named worksheet. Cached via
// Next.js's fetch cache (revalidate: 60) -- shared across requests/
// instances on Vercel, not just per-process memory.
async function getTableRows(
  worksheet: string,
  table: string,
): Promise<string[][]> {
  const driveId = process.env.MS_DRIVE_ID;
  const itemId = process.env.MS_WORKBOOK_ITEM_ID;
  if (!driveId || !itemId) return [];

  const token = await getAccessToken();
  if (!token) return [];

  const url =
    `${GRAPH_ROOT}/drives/${driveId}/items/${itemId}` +
    `/workbook/worksheets('${worksheet}')/tables('${table}')/rows`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: LIST_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as GraphTableRowsResponse;
    return (data.value ?? []).map((row) => (row.values?.[0] ?? []) as string[]);
  } catch {
    return [];
  }
}

// email -> last-confirmed-member timestamp (ms). Best-effort, per warm
// instance -- see the file-level comment above.
const positiveCache = new Map<string, number>();

export async function isApprovedMember(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const confirmedAt = positiveCache.get(normalized);
  if (confirmedAt && Date.now() - confirmedAt < POSITIVE_CACHE_TTL_MS) {
    return true;
  }

  const rows = await getTableRows("Members", "MembersTable");
  const found = rows.some(
    (row) => String(row[0] ?? "").trim().toLowerCase() === normalized,
  );

  if (found) {
    positiveCache.set(normalized, Date.now());
  }
  return found;
}

export type MemberResource = { label: string; url: string };

export async function getMemberResources(): Promise<MemberResource[]> {
  const rows = await getTableRows("Resources", "ResourcesTable");
  return rows
    .map((row) => ({
      label: String(row[0] ?? "").trim(),
      url: String(row[1] ?? "").trim(),
    }))
    .filter((resource) => resource.label && resource.url);
}
