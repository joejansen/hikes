import Link from "next/link";
import type { HikeSummary } from "@/lib/hike-summary";
import {
  countryFlag,
  formatElevation,
  formatLength,
  obscurityStars,
} from "@/lib/format";
import { SeasonStrip } from "./season-strip";
import { StatusBadge } from "./status-badge";

export const DIFFICULTY_STYLES: Record<HikeSummary["difficulty"], string> = {
  easy: "text-emerald-700 dark:text-emerald-300",
  moderate: "text-sky-700 dark:text-sky-300",
  hard: "text-amber-700 dark:text-amber-300",
  "very-hard": "text-rose-700 dark:text-rose-300",
};

type CompareControl = {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
};

type Props = {
  hike: HikeSummary;
  href?: string;
  compare?: CompareControl;
};

export function HikeCard({ hike, href, compare }: Props) {
  return (
    <article className="group relative flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-sm transition has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-sky-500">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg leading-tight">
          {/* The ::after overlay makes the whole card clickable while keeping
              the compare checkbox a separate, valid interactive element. */}
          <Link
            href={href ?? `/hikes/${hike.slug}`}
            className="group-hover:underline focus:outline-none after:absolute after:inset-0 after:rounded-lg"
          >
            {hike.name}
          </Link>
        </h3>
        <StatusBadge status={hike.status} />
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

      <dl className="grid grid-cols-3 gap-2 text-xs mb-3">
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

      <SeasonStrip seasons={hike.best_seasons} />

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        {/* Raised above the link overlay so the tooltip still shows. */}
        <div
          className="relative z-[1]"
          title={`Obscurity: ${hike.obscurity}/5 (5 = least touristy)`}
        >
          <span className="font-mono tracking-tight">
            {obscurityStars(hike.obscurity)}
          </span>{" "}
          obscurity
        </div>
        {compare && (
          <label
            className={`relative z-[1] flex items-center gap-1.5 select-none ${
              compare.disabled ? "opacity-40" : "cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
            title={compare.disabled ? "Compare is limited to 4 hikes" : undefined}
          >
            <input
              type="checkbox"
              checked={compare.checked}
              disabled={compare.disabled}
              onChange={compare.onToggle}
              aria-label={`Compare ${hike.name}`}
              className="accent-sky-600"
            />
            compare
          </label>
        )}
      </div>
    </article>
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
