import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HikeLocatorMap } from "@/components/hike-locator-map";
import { HikeSetNav } from "@/components/hike-set-nav";
import { SeasonStrip } from "@/components/season-strip";
import { StatusBadge } from "@/components/status-badge";
import { findHike, loadHikes, loadSummaries } from "@/lib/load-hikes";
import {
  countryFlag,
  formatDailyAverage,
  formatElevation,
  formatLength,
  obscurityStars,
} from "@/lib/format";
import type { HikeSummary } from "@/lib/hike-summary";
import { readMapApiKey } from "@/lib/map-key";
import { nearestHikes, similarHikes } from "@/lib/related";

const RELATED_COUNT = 4;

export function generateStaticParams() {
  return loadHikes().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hike = findHike(slug);
  if (!hike) return { title: "Not found" };
  return {
    title: `${hike.name} · Hike Research`,
    description: `${hike.country}${hike.region ? `, ${hike.region}` : ""} — ${hike.highlights[0]}`,
  };
}

export default async function HikePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hike = findHike(slug);
  if (!hike) notFound();

  const summaries = loadSummaries();
  const self = summaries.find((h) => h.slug === slug)!;
  const nearby = nearestHikes(self, summaries, RELATED_COUNT);
  const similar = similarHikes(
    self,
    summaries,
    RELATED_COUNT,
    nearby.map((n) => n.hike.slug),
  );
  const daily = formatDailyAverage(
    hike.length_days,
    hike.length_km,
    hike.elevation_gain_m,
  );

  return (
    <article className="max-w-3xl mx-auto">
      <Suspense
        fallback={
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← all hikes
          </Link>
        }
      >
        <HikeSetNav slug={slug} />
      </Suspense>

      <header className="mt-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">
            {hike.name}
          </h1>
          <div className="mt-2">
            <StatusBadge status={hike.status} />
          </div>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          {countryFlag(hike.country)} {hike.country}
          {hike.region ? ` · ${hike.region}` : ""}
        </p>
      </header>

      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 text-sm">
        <Stat label="Length" value={formatLength(hike.length_km, hike.length_days) || "—"} />
        <Stat label="Elevation gain" value={formatElevation(hike.elevation_gain_m) || "—"} />
        <Stat label="Per day" value={daily || "—"} />
        <Stat label="Difficulty" value={hike.difficulty} />
        <Stat
          label="Obscurity"
          value={
            <span className="font-mono" title={`${hike.obscurity}/5`}>
              {obscurityStars(hike.obscurity)}
            </span>
          }
        />
      </dl>

      <div className="flex flex-wrap gap-2 mb-8">
        <Chip>{hike.style}</Chip>
        <Chip>{hike.pack_weight} pack</Chip>
        {hike.accommodation.map((a) => (
          <Chip key={a}>{a}</Chip>
        ))}
      </div>

      <Section title="Best seasons">
        <SeasonStrip seasons={hike.best_seasons} size="md" />
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {hike.best_seasons.join(", ")}
        </p>
      </Section>

      <Section title="Highlights">
        <ul className="space-y-1.5">
          {hike.highlights.map((h, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 select-none">
                +
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </Section>

      {hike.downsides.length > 0 && (
        <Section title="Downsides">
          <ul className="space-y-1.5">
            {hike.downsides.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-rose-600 dark:text-rose-400 select-none">
                  −
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {hike.guide_links.length > 0 && (
        <Section title="Guide links">
          <ul className="space-y-1.5">
            {hike.guide_links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 dark:text-sky-400 hover:underline"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {hike.notes.trim() && (
        <Section title="Notes">
          <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
            {hike.notes.trim()}
          </div>
        </Section>
      )}

      <Section title="Where it is">
        <HikeLocatorMap
          hikes={[self, ...nearby.map((n) => n.hike)]}
          focusSlug={slug}
          apiKey={readMapApiKey()}
        />
        <p className="mt-2 text-xs text-neutral-500">
          Approximate center of the route. Blue pins are the nearest other
          hikes in the catalog.
        </p>
      </Section>

      <div className="grid sm:grid-cols-2 gap-x-8">
        <Section title="Nearby">
          <RelatedList
            items={nearby.map((n) => ({
              hike: n.hike,
              detail: `${Math.round(n.km).toLocaleString("en-US")} km away`,
            }))}
          />
        </Section>
        <Section title="Similar trips elsewhere">
          <RelatedList
            items={similar.map((h) => ({
              hike: h,
              detail: `${formatLength(h.length_km, h.length_days)} · ${h.difficulty}`,
            }))}
          />
        </Section>
      </div>
    </article>
  );
}

function RelatedList({
  items,
}: {
  items: { hike: HikeSummary; detail: string }[];
}) {
  return (
    <ul className="space-y-2">
      {items.map(({ hike, detail }) => (
        <li key={hike.slug}>
          <Link
            href={`/hikes/${hike.slug}`}
            className="font-medium hover:underline"
          >
            {hike.name}
          </Link>
          <div className="text-xs text-neutral-500">
            {countryFlag(hike.country)} {hike.country} · {detail}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
        {title}
      </h2>
      {children}
    </section>
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
    <div className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
      {children}
    </span>
  );
}
