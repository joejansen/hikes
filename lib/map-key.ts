export function readMapApiKey(): string | null {
  const raw = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  return raw ? raw : null;
}
