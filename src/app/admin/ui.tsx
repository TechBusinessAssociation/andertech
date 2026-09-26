// Shared look for the /admin pages, so every table and form matches.

export const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
export const fieldLabelClass = "flex flex-col gap-1 text-sm font-medium";
export const primaryButtonClass =
  "inline-flex w-fit items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue";
export const secondaryButtonClass =
  "inline-flex w-fit items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900";
export const dangerButtonClass =
  "text-sm text-red-700 underline hover:text-red-900 dark:text-red-400";
export const linkClass =
  "text-brand-navy underline hover:text-brand-blue dark:text-brand-blue";
export const cardClass =
  "flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800";
// `relative` keeps the absolutely-positioned sr-only header labels inside the
// scroll box; without it they escape and make the whole page scroll sideways.
export const tableWrapClass =
  "relative overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800";
export const tableClass = "w-full text-left text-sm";
export const theadClass =
  "bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400";
export const thClass = "px-3 py-2 font-semibold";
export const tdClass = "px-3 py-2 align-top";
export const trClass = "border-t border-zinc-200 dark:border-zinc-800";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}

export function Notice({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      {message}
    </p>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand";
}) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
    brand: "bg-brand-navy text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
