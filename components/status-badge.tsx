import type { Status } from "@/lib/schema";

const STATUS_STYLES: Record<Status, string> = {
  researching:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  shortlisted: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  done: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  passed:
    "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
