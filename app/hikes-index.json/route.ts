import { loadSummaries } from "@/lib/load-hikes";

// Prerendered at build time; consumed by the hike page's prev/next navigation.
export const dynamic = "force-static";

export function GET() {
  return Response.json(loadSummaries());
}
