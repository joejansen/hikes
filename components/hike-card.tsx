import Link from "next/link";
import type { Hike } from "@/lib/schema";
import {
  countryFlag,
  formatElevation,
  formatLength,
  obscurityStars,
} from "@/lib/format";

const STATUS_STYLES: Record<Hike["status"], string> = {
  researching:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  shortlisted:
    "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  done: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  passed:
    "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const DIFFICULTY_STYLES: Record<Hike["difficulty"], string> = {
  easy: "text-emerald-700 dark:text-emerald-300",
  moderate: "text-sky-700 dark:text-sky-300",
  hard: "text-amber-700 dark:text-amber-300",
  "very-hard": "text-rose-700 dark:text-rose-300",
};

export function HikeCard({ hike }: { hike: Hike }) {
  return (
    <Link
      href={`/hikes/${hike.slug}`}
      className="group block rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg leading-tight group-hover:underline">
          {hike.name}
        </h3>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[hike.status]}`}
        >
          {hike.status}
        </span>
      </div>

      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
        <span className="mr-1">{countryFlag(hike.country)}</span>
        {hike.country}
        {hike.region ? ` · ${hike.region}` : ""}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Tag>{hike.style}</Tag>
        <Tag>{hike.pack_weight} pack</Tag>
        {hike.accommodation.slice(0, 2).map((a) => (
          <Tag key={a}>{a}</Tag>
        ))}
      </div>

      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="length" value={formatLength(hike.length_km, hike.length_days) || "—"} />
        <Stat label="elev" value={formatElevation(hike.elevation_gain_m) || "—"} />
        <Stat
          label="difficulty"
          value={
            <span className={DIFFICULTY_STYLES[hike.difficulty]}>
              {hike.difficulty}
            </span>
          }
        />
      </dl>

      <div
        className="mt-3 text-xs text-neutral-500 dark:text-neutral-400"
        title={`Obscurity: ${hike.obscurity}/5 (5 = least touristy)`}
      >
        <span className="font-mono tracking-tight">{obscurityStars(hike.obscurity)}</span>{" "}
        obscurity
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-neutral-500 dark:text-neutral-500 uppercase tracking-wide text-[10px]">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
