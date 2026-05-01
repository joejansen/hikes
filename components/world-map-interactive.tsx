"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

type Pin = {
  slug: string;
  name: string;
  country: string;
  x: number;
  y: number;
};

type Props = {
  width: number;
  height: number;
  landPath: string;
  bordersPath: string;
  pins: Pin[];
};

type View = { scale: number; tx: number; ty: number };

const MIN_SCALE = 1;
const MAX_SCALE = 12;
const ZOOM_STEP = 1.6;
const DRAG_CLICK_THRESHOLD = 4;
const SCALE_EPSILON = 1e-6;
const INITIAL_VIEW: View = { scale: 1, tx: 0, ty: 0 };

function clampView(width: number, height: number, view: View): View {
  let scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale));
  // Snap to MIN_SCALE when within epsilon so accumulated float drift from
  // repeated wheel/button zooms doesn't leave the view "almost reset".
  if (scale - MIN_SCALE < SCALE_EPSILON) scale = MIN_SCALE;
  const maxTx = width * (scale - 1);
  const maxTy = height * (scale - 1);
  return {
    scale,
    tx: Math.min(0, Math.max(-maxTx, view.tx)),
    ty: Math.min(0, Math.max(-maxTy, view.ty)),
  };
}

export function WorldMapInteractive({
  width,
  height,
  landPath,
  bordersPath,
  pins,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const [isDragging, setIsDragging] = useState(false);

  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
    rectWidth: number;
    rectHeight: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const svgPointFromEvent = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return [
        ((clientX - rect.left) / rect.width) * width,
        ((clientY - rect.top) / rect.height) * height,
      ];
    },
    [width, height],
  );

  const zoomAt = useCallback(
    (factor: number, focusX: number, focusY: number) => {
      setView((prev) => {
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, prev.scale * factor),
        );
        if (nextScale === prev.scale) return prev;
        const ratio = nextScale / prev.scale;
        return clampView(width, height, {
          scale: nextScale,
          tx: focusX - (focusX - prev.tx) * ratio,
          ty: focusY - (focusY - prev.ty) * ratio,
        });
      });
    },
    [width, height],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const point = svgPointFromEvent(e.clientX, e.clientY);
      if (!point) return;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomAt(factor, point[0], point[1]);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [svgPointFromEvent, zoomAt]);

  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const svg = svgRef.current;
      if (!svg) return;
      // Reset on every interaction so an interrupted drag can't suppress
      // a subsequent legitimate click.
      suppressClickRef.current = false;
      const rect = svg.getBoundingClientRect();
      dragState.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTx: view.tx,
        startTy: view.ty,
        rectWidth: rect.width,
        rectHeight: rect.height,
        moved: false,
      };
      // Note: pointer capture is deferred until movement crosses the drag
      // threshold (see handlePointerMove). Capturing eagerly would retarget
      // the subsequent `click` event to the SVG, preventing nested <Link>
      // pins from receiving clicks.
    },
    [view.tx, view.ty],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      if (
        !drag.moved &&
        Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) >
          DRAG_CLICK_THRESHOLD
      ) {
        drag.moved = true;
        const svg = svgRef.current;
        if (svg && !svg.hasPointerCapture(e.pointerId)) {
          svg.setPointerCapture(e.pointerId);
        }
        setIsDragging(true);
      }
      if (!drag.moved) return;
      const dx = ((e.clientX - drag.startX) / drag.rectWidth) * width;
      const dy = ((e.clientY - drag.startY) / drag.rectHeight) * height;
      setView((prev) =>
        clampView(width, height, {
          scale: prev.scale,
          tx: drag.startTx + dx,
          ty: drag.startTy + dy,
        }),
      );
    },
    [width, height],
  );

  const endDrag = useCallback(
    (e: PointerEvent<SVGSVGElement>, suppressNextClick: boolean) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const svg = svgRef.current;
      if (svg && svg.hasPointerCapture(e.pointerId)) {
        svg.releasePointerCapture(e.pointerId);
      }
      suppressClickRef.current = suppressNextClick && drag.moved;
      dragState.current = null;
      if (drag.moved) setIsDragging(false);
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<SVGSVGElement>) => endDrag(e, true),
    [endDrag],
  );

  // On cancel there's no following click event to clear suppressClickRef,
  // so don't arm it.
  const handlePointerCancel = useCallback(
    (e: PointerEvent<SVGSVGElement>) => endDrag(e, false),
    [endDrag],
  );

  const zoomFromButton = useCallback(
    (factor: number) => zoomAt(factor, width / 2, height / 2),
    [zoomAt, width, height],
  );

  const reset = useCallback(() => setView(INITIAL_VIEW), []);

  const inv = 1 / view.scale;
  const isReset =
    view.scale === INITIAL_VIEW.scale &&
    view.tx === INITIAL_VIEW.tx &&
    view.ty === INITIAL_VIEW.ty;

  return (
    <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto touch-none select-none"
        role="img"
        aria-label="World map of catalogued hikes"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClickRef.current = false;
          }
        }}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          className="fill-neutral-50 dark:fill-neutral-950"
        />
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
          <path
            d={landPath}
            className="fill-neutral-200 dark:fill-neutral-800"
            stroke="none"
          />
          <path
            d={bordersPath}
            className="stroke-neutral-400/70 dark:stroke-neutral-600/70"
            fill="none"
            strokeWidth={0.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {pins.map((p) => (
            <Link key={p.slug} href={`/hikes/${p.slug}`} aria-label={p.name}>
              <g className="group cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6 * inv}
                  className="fill-sky-500/30 group-hover:fill-sky-500/60 transition"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3 * inv}
                  className="fill-sky-600 group-hover:fill-sky-400 transition"
                />
                <title>{`${p.name} · ${p.country}`}</title>
              </g>
            </Link>
          ))}
        </g>
      </svg>

      <div className="absolute top-3 right-3 flex flex-col rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur overflow-hidden">
        <button
          type="button"
          onClick={() => zoomFromButton(ZOOM_STEP)}
          aria-label="Zoom in"
          disabled={view.scale >= MAX_SCALE}
          className="w-8 h-8 flex items-center justify-center text-lg leading-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomFromButton(1 / ZOOM_STEP)}
          aria-label="Zoom out"
          disabled={view.scale <= MIN_SCALE}
          className="w-8 h-8 flex items-center justify-center text-lg leading-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent border-t border-neutral-200 dark:border-neutral-800"
        >
          −
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset view"
          disabled={isReset}
          className="w-8 h-8 flex items-center justify-center text-sm leading-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent border-t border-neutral-200 dark:border-neutral-800"
        >
          ⤾
        </button>
      </div>
    </div>
  );
}
