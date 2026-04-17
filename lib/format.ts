const FLAGS: Record<string, string> = {
  Nepal: "🇳🇵",
  Georgia: "🇬🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Switzerland: "🇨🇭",
  Spain: "🇪🇸",
  "United Kingdom": "🇬🇧",
  Iceland: "🇮🇸",
  Japan: "🇯🇵",
  Norway: "🇳🇴",
  Sweden: "🇸🇪",
  Slovenia: "🇸🇮",
  Morocco: "🇲🇦",
  Peru: "🇵🇪",
  Chile: "🇨🇱",
  Argentina: "🇦🇷",
  Greece: "🇬🇷",
  Turkey: "🇹🇷",
  Kyrgyzstan: "🇰🇬",
  Pakistan: "🇵🇰",
  India: "🇮🇳",
  Bhutan: "🇧🇹",
  "New Zealand": "🇳🇿",
  Canada: "🇨🇦",
  "United States": "🇺🇸",
  Austria: "🇦🇹",
  Germany: "🇩🇪",
  Portugal: "🇵🇹",
};

export function countryFlag(country: string): string {
  return FLAGS[country] ?? "🏳️";
}

export function obscurityStars(n: number): string {
  return "●".repeat(n) + "○".repeat(5 - n);
}

export function formatLength(km?: number, days?: number): string {
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (km) parts.push(`${km}km`);
  return parts.join(" · ");
}

export function formatElevation(m?: number): string {
  if (!m) return "";
  return `${m.toLocaleString()}m gain`;
}
