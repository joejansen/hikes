import Link from "next/link";
import { notFound } from "next/navigation";
import { findHike, loadHikes } from "@/lib/load-hikes";
import {
  countryFlag,
  formatElevation,
  formatLength,
  obscurityStars,
} from "@/lib/format";

export function generateStaticParams() {
  return loadHikes().map((h) => ({ slug: h.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const hike = findHike(slug);
    return { title: hike ? `${hike.name} · Hike Research` : "Not found" };
  });
}

export default async function HikePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hike = findHike(slug);
  if (!hike) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        ← all hikes
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">
          {hike.name}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {countryFlag(hike.country)} {hike.country}
          {hike.region ? ` · ${hike.region}` : ""}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-sm">
        <Stat label="Length" value={formatLength(hike.length_km, hike.length_days) || "—"} />
        <Stat label="Elevation gain" value={formatElevation(hike.elevation_gain_m) || "—"} />
        <Stat label="Difficulty" value={hike.difficulty} />
        <Stat
          label="Obscurity"
          value={
            <span className="font-mono" title={`${hike.obscurity}/5`}>
              {obscurityStars(hike.obscurity)}
            </span>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Chip>{hike.style}</Chip>
        <Chip>{hike.pack_weight} pack</Chip>
        {hike.accommodation.map((a) => (
          <Chip key={a}>{a}</Chip>
        ))}
        <Chip tone="status">{hike.status}</Chip>
      </div>

      <Section title="Best seasons">
        <div className="flex flex-wrap gap-1.5">
          {hike.best_seasons.map((m) => (
            <Chip key={m}>{m}</Chip>
          ))}
        </div>
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
          <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
            {hike.notes.trim()}
          </div>
        </Section>
      )}
    </article>
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

function Chip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "status";
}) {
  const classes =
    tone === "status"
      ? "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200"
      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${classes}`}>
      {children}
    </span>
  );
}
