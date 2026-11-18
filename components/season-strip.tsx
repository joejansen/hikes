import { MONTHS, type Month } from "@/lib/schema";

// Twelve cells, January to December, with the good months filled in.
export function SeasonStrip({
  seasons,
  size = "sm",
}: {
  seasons: readonly Month[];
  size?: "sm" | "md";
}) {
  const cell =
    size === "md" ? "h-7 text-xs rounded" : "h-4 text-[9px] rounded-sm";
  return (
    <div
      role="img"
      aria-label={`Best months: ${seasons.join(", ")}`}
      className={`grid grid-cols-12 ${size === "md" ? "gap-1 max-w-md" : "gap-0.5"}`}
    >
      {MONTHS.map((m) => {
        const on = seasons.includes(m);
        return (
          <span
            key={m}
            aria-hidden
            title={m}
            className={`flex items-center justify-center font-medium ${cell} ${
              on
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950"
                : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600"
            }`}
          >
            {m[0]}
          </span>
        );
      })}
    </div>
  );
}
