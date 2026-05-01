"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hike } from "@/lib/schema";
import {
  countryFlag,
  formatLength,
  obscurityStars,
} from "@/lib/format";

type StyleId = "outdoor" | "streets" | "satellite";

const STYLE_PATHS: Record<StyleId, string> = {
  outdoor: "outdoor-v2",
  streets: "streets-v2",
  satellite: "hybrid",
};

const STYLE_OPTIONS: { id: StyleId; label: string }[] = [
  { id: "outdoor", label: "Outdoor" },
  { id: "streets", label: "Streets" },
  { id: "satellite", label: "Satellite" },
];

const FALLBACK_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const MAP_HEIGHT_PX = 560;
const INITIAL_VIEW = { longitude: 10, latitude: 25, zoom: 1.4 };

function styleUrl(id: StyleId, key: string): string {
  return `https://api.maptiler.com/maps/${STYLE_PATHS[id]}/style.json?key=${key}`;
}

function difficultyLabel(d: Hike["difficulty"]): string {
  return d.replace("-", " ");
}

function seasonsLabel(seasons: Hike["best_seasons"]): string {
  if (seasons.length === 0) return "";
  if (seasons.length >= 6) return `${seasons.length} months`;
  return seasons.map((m) => m.slice(0, 3)).join(", ");
}

type Props = {
  hikes: Hike[];
  apiKey: string | null;
};

export function HikeMap({ hikes, apiKey }: Props) {
  const [styleId, setStyleId] = useState<StyleId>("outdoor");
  const [hovered, setHovered] = useState<Hike | null>(null);

  const mapStyle = useMemo(
    () => (apiKey ? styleUrl(styleId, apiKey) : FALLBACK_STYLE),
    [styleId, apiKey],
  );

  // If filters drop the currently-hovered hike, hide the popup. The state
  // itself stays set; the next hover/leave will overwrite it.
  const activeHover = useMemo(() => {
    if (!hovered) return null;
    return hikes.some((h) => h.slug === hovered.slug) ? hovered : null;
  }, [hikes, hovered]);

  const handleEnter = useCallback((h: Hike) => setHovered(h), []);
  const handleLeave = useCallback(
    (h: Hike) => setHovered((cur) => (cur === h ? null : cur)),
    [],
  );

  return (
    <div
      className="relative rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-100 dark:bg-neutral-900"
      style={{ height: MAP_HEIGHT_PX }}
    >
      <Map
        initialViewState={INITIAL_VIEW}
        mapStyle={mapStyle}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <ScaleControl position="bottom-left" />

        <MarkerList
          hikes={hikes}
          onEnter={handleEnter}
          onLeave={handleLeave}
        />

        {activeHover && (
          <Popup
            longitude={activeHover.coordinates[1]}
            latitude={activeHover.coordinates[0]}
            anchor="bottom"
            offset={14}
            closeButton={false}
            closeOnClick={false}
          >
            <PopupContents hike={activeHover} />
          </Popup>
        )}
      </Map>

      {hikes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 shadow-sm">
            No hikes match the current filters.
          </div>
        </div>
      )}

      {apiKey && (
        <div className="absolute top-3 left-3 flex rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur overflow-hidden shadow-sm">
          {STYLE_OPTIONS.map((opt) => {
            const active = styleId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStyleId(opt.id)}
                aria-pressed={active}
                className={`px-2.5 py-1 text-xs ${
                  active
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {!apiKey && (
        <div className="absolute bottom-3 right-3 max-w-xs text-xs px-3 py-2 rounded-md bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900">
          Set <code className="font-mono">NEXT_PUBLIC_MAPTILER_KEY</code> to
          enable terrain &amp; satellite layers.
        </div>
      )}
    </div>
  );
}

type MarkerListProps = {
  hikes: Hike[];
  onEnter: (h: Hike) => void;
  onLeave: (h: Hike) => void;
};

const MarkerList = memo(function MarkerList({
  hikes,
  onEnter,
  onLeave,
}: MarkerListProps) {
  return (
    <>
      {hikes.map((h) => (
        <Marker
          key={h.slug}
          longitude={h.coordinates[1]}
          latitude={h.coordinates[0]}
          anchor="center"
        >
          <Link
            href={`/hikes/${h.slug}`}
            aria-label={`Open ${h.name}`}
            onMouseEnter={() => onEnter(h)}
            onMouseLeave={() => onLeave(h)}
            onFocus={() => onEnter(h)}
            onBlur={() => onLeave(h)}
            onClick={(e) => e.stopPropagation()}
            // 32x32 transparent hit area (touch-friendly) wrapping the
            // 12x12 visible dot. Keeps the dot small without making the
            // marker hard to tap on mobile.
            className="group flex items-center justify-center w-8 h-8 -m-2.5 focus:outline-none cursor-pointer"
          >
            <span className="block w-3 h-3 rounded-full bg-sky-600 ring-2 ring-sky-300/70 group-hover:bg-sky-500 group-hover:ring-sky-200 group-hover:scale-125 group-focus-visible:ring-sky-400 transition" />
          </Link>
        </Marker>
      ))}
    </>
  );
});

function PopupContents({ hike }: { hike: Hike }) {
  const len = formatLength(hike.length_km, hike.length_days);
  const meta = [len, difficultyLabel(hike.difficulty)].filter(Boolean);
  const seasons = seasonsLabel(hike.best_seasons);

  return (
    <div className="font-sans text-neutral-900 min-w-[180px] max-w-[240px]">
      <div className="font-semibold text-sm leading-tight mb-1">
        {hike.name}
      </div>
      <div className="text-xs text-neutral-600 mb-1.5">
        <span className="mr-1">{countryFlag(hike.country)}</span>
        {hike.country}
        {hike.region ? ` · ${hike.region}` : ""}
      </div>
      <div className="text-xs text-neutral-700 mb-1">{meta.join(" · ")}</div>
      {seasons && (
        <div className="text-xs text-neutral-600 mb-1">good in {seasons}</div>
      )}
      <div className="text-xs text-neutral-500 font-mono tracking-tight">
        {obscurityStars(hike.obscurity)}
      </div>
    </div>
  );
}
